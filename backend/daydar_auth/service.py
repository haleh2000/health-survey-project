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
    claim_mobile = claims.get("mobile") or ""
    claim_first_name = claims.get("firstName") or ""
    claim_last_name = claims.get("lastName") or ""

    if not user_id:
        raise DaydarError(
            "شناسه کاربر از سرویس دایدار دریافت نشد.", status_code=502
        )

    profile_payload = await daydar_client.fetch_profile(user_id, daydar_access_token)
    profile_user = profile_payload.get("user") or {}

    national_id = _digits_only(profile_user.get("nationalID") or "")
    if not national_id:
        raise DaydarError(
            "کد ملی کاربر در سامانه دایدار ثبت نشده است.", status_code=422
        )

    first_name = profile_user.get("firstName") or claim_first_name
    last_name = profile_user.get("lastName") or claim_last_name
    full_name = " ".join(part for part in [first_name, last_name] if part).strip()
    mobile = profile_user.get("mobile") or claim_mobile

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
