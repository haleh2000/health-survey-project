"""Shared login finalization: Daydar identity -> local Person -> local session.

Both the in-app flow (OTP / password) and the registration flow funnel
through `finalize_login` once Daydar hands back a token pair, mirroring the
reference project's `daydarAccountLinker` + `sessionIssuer` split.
"""

from __future__ import annotations

from datetime import datetime, timezone

import jwt as pyjwt
from sqlalchemy.orm import Session

from db_models import Person, RefreshToken

from .client import DaydarError, daydar_client, extract_daydar_tokens
from .schemas import AuthSessionOut, AuthUserOut
from .security import (
    create_access_token,
    generate_refresh_token,
    hash_refresh_token,
    refresh_token_expiry,
)


def _digits_only(value: str) -> str:
    return "".join(ch for ch in (value or "") if ch.isdigit())


def is_valid_national_id(value: str) -> bool:
    """Iranian national code: 10 digits, not a repdigit, valid check digit."""
    if len(value) != 10 or not value.isdigit() or len(set(value)) == 1:
        return False
    total = sum(int(value[i]) * (10 - i) for i in range(9))
    remainder = total % 11
    check = int(value[9])
    return check == remainder if remainder < 2 else check == 11 - remainder


def _clean_national_id(value: str, mobile: str) -> str:
    """Returns the national id only if it is a real one, never the mobile."""
    digits = _digits_only(value)
    if not is_valid_national_id(digits):
        return ""
    mobile_digits = _digits_only(mobile)
    if mobile_digits and mobile_digits[-10:] == digits:
        return ""
    return digits


def decode_daydar_claims(access_token: str) -> dict:
    # Daydar's signing key is not available to us; we only read the claims of
    # a token we just received directly from Daydar over TLS, we do not trust
    # tokens presented by a client, so skipping signature verification here
    # mirrors the reference implementation and is safe in this context.
    return pyjwt.decode(access_token, options={"verify_signature": False})


async def finalize_login(db: Session, token_payload: dict) -> AuthSessionOut:
    daydar_access_token, _daydar_refresh_token = extract_daydar_tokens(token_payload)

    try:
        claims = decode_daydar_claims(daydar_access_token)
    except pyjwt.PyJWTError as exc:
        raise DaydarError(
            "توکن نامعتبر از سرویس احراز هویت دایدار دریافت شد.", status_code=502
        ) from exc

    user_id = str(claims.get("ID") or "")
    first_name = claims.get("firstName") or ""
    last_name = claims.get("lastName") or ""
    mobile = claims.get("mobile") or ""
    # A `nationalID` claim that is not a valid national code (e.g. the mobile)
    # is discarded, so the profile lookup below can supply the real one.
    national_id = _clean_national_id(claims.get("nationalID") or "", mobile)

    if not user_id:
        raise DaydarError(
            "شناسه کاربر از سرویس دایدار دریافت نشد.", status_code=502
        )

    # Recent Daydar tokens already carry the national ID and name; only fall
    # back to the profile endpoint when an older/partner token omits them.
    if not national_id:
        profile_payload = await daydar_client.fetch_profile(
            user_id, daydar_access_token
        )
        profile_user = profile_payload.get("user") or {}

        first_name = profile_user.get("firstName") or first_name
        last_name = profile_user.get("lastName") or last_name
        mobile = profile_user.get("mobile") or mobile
        national_id = _clean_national_id(profile_user.get("nationalID") or "", mobile)

    if not national_id:
        raise DaydarError(
            "کد ملی کاربر در سامانه دایدار ثبت نشده است.", status_code=422
        )

    full_name = " ".join(part for part in [first_name, last_name] if part).strip()

    person = db.query(Person).filter(Person.national_id == national_id).first()

    if person:
        if full_name:
            person.full_name = full_name
        if mobile:
            person.mobile = mobile
    else:
        person = Person(national_id=national_id, full_name=full_name, mobile=mobile)
        db.add(person)
        db.flush()

    return issue_session(db, person)


def issue_session(db: Session, person: Person) -> AuthSessionOut:
    """Mint our local session: JWT access token + DB-backed refresh token."""

    local_access_token, access_expires_at = create_access_token(
        person.national_id, person.full_name or ""
    )

    refresh_plain = generate_refresh_token()
    refresh_expires_at = refresh_token_expiry()

    db.add(
        RefreshToken(
            person_national_id=person.national_id,
            token_hash=hash_refresh_token(refresh_plain),
            expires_at=refresh_expires_at,
        )
    )

    db.commit()

    return AuthSessionOut(
        access_token=local_access_token,
        access_token_expires_at=int(access_expires_at.timestamp() * 1000),
        refresh_token=refresh_plain,
        refresh_token_expires_at=int(refresh_expires_at.timestamp() * 1000),
        user=AuthUserOut(
            national_id=person.national_id,
            full_name=person.full_name,
            mobile=person.mobile,
        ),
    )
