import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from db_models import Person, RefreshToken

from .client import DaydarError, daydar_client
from .deps import get_current_person
from .schemas import (
    AuthSessionOut,
    AuthUserOut,
    LogoutRequest,
    MobileLoginRequest,
    MobileLoginResponse,
    OtpSendResponse,
    OtpVerifyRequest,
    PasswordLoginRequest,
    RefreshRequest,
    RefreshResponse,
    RegisterRequest,
    SessionIdRequest,
    VerifyIdentityRequest,
    VerifyIdentityResponse,
)
from .security import (
    create_access_token,
    hash_refresh_token,
)
from .service import finalize_login

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])


def _raise_from_daydar(exc: DaydarError) -> None:
    logger.warning("Daydar auth error: %s", exc.message)
    raise HTTPException(status_code=exc.status_code, detail=exc.message)


@router.post("/didar/mobile", response_model=MobileLoginResponse)
async def start_mobile_login(payload: MobileLoginRequest):
    try:
        result = await daydar_client.start_mobile_login(
            payload.mobile, payload.captcha, payload.session_id
        )
    except DaydarError as exc:
        if exc.captcha:
            return MobileLoginResponse(
                session_id=payload.session_id or "",
                captcha_required=True,
                captcha=exc.captcha,
            )
        _raise_from_daydar(exc)

    return MobileLoginResponse(
        session_id=result.get("sessionID") or result.get("sessionId") or "",
        captcha_required=bool(result.get("captcha")),
        captcha=result.get("captcha"),
        registered=result.get("registered"),
    )


@router.post("/didar/otp/send", response_model=OtpSendResponse)
async def send_otp(payload: SessionIdRequest):
    try:
        result = await daydar_client.send_otp(payload.session_id)
    except DaydarError as exc:
        _raise_from_daydar(exc)

    return OtpSendResponse(
        session_id=result.get("sessionID") or result.get("sessionId") or payload.session_id,
        expires_in=result.get("exp") or result.get("expiresIn"),
    )


@router.post("/didar/otp/verify", response_model=AuthSessionOut)
async def verify_otp(payload: OtpVerifyRequest, db: Session = Depends(get_db)):
    try:
        token_payload = await daydar_client.verify_otp(payload.session_id, payload.code)
        return await finalize_login(db, token_payload)
    except DaydarError as exc:
        _raise_from_daydar(exc)


@router.post("/didar/password", response_model=AuthSessionOut)
async def login_with_password(payload: PasswordLoginRequest, db: Session = Depends(get_db)):
    try:
        token_payload = await daydar_client.login_with_password(
            payload.session_id, payload.password
        )
        return await finalize_login(db, token_payload)
    except DaydarError as exc:
        _raise_from_daydar(exc)


@router.post("/didar/register/identity", response_model=VerifyIdentityResponse)
async def verify_identity(payload: VerifyIdentityRequest):
    try:
        result = await daydar_client.verify_identity(
            payload.session_id, payload.national_id, payload.birth_date
        )
    except DaydarError as exc:
        _raise_from_daydar(exc)

    data = result.get("data") or result

    return VerifyIdentityResponse(
        session_id=payload.session_id,
        first_name=data.get("firstName") or data.get("FirstName") or "",
        last_name=data.get("lastName") or data.get("LastName") or "",
        father_name=data.get("fatherName") or data.get("FatherName"),
        national_id=payload.national_id,
        mobile=data.get("mobile") or data.get("Mobile"),
    )


@router.post("/didar/register", response_model=AuthSessionOut)
async def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    if payload.password != payload.password_confirm:
        raise HTTPException(status_code=422, detail="رمز عبور و تکرار آن یکسان نیستند.")

    try:
        token_payload = await daydar_client.register(
            payload.session_id, payload.password, payload.password_confirm
        )
        return await finalize_login(db, token_payload)
    except DaydarError as exc:
        _raise_from_daydar(exc)


@router.post("/refresh", response_model=RefreshResponse)
async def refresh_access_token(payload: RefreshRequest, db: Session = Depends(get_db)):
    token_hash = hash_refresh_token(payload.refresh_token)

    stored = (
        db.query(RefreshToken)
        .filter(RefreshToken.token_hash == token_hash, RefreshToken.revoked.is_(False))
        .first()
    )

    if not stored or stored.expires_at.replace(tzinfo=timezone.utc) <= datetime.now(
        timezone.utc
    ):
        raise HTTPException(status_code=401, detail="نشست شما منقضی شده است.")

    person = (
        db.query(Person)
        .filter(Person.national_id == stored.person_national_id)
        .first()
    )

    if not person:
        raise HTTPException(status_code=401, detail="کاربر یافت نشد.")

    access_token, access_expires_at = create_access_token(
        person.national_id, person.full_name or ""
    )

    return RefreshResponse(
        access_token=access_token,
        access_token_expires_at=int(access_expires_at.timestamp() * 1000),
    )


@router.post("/logout", status_code=204)
async def logout(payload: LogoutRequest, db: Session = Depends(get_db)):
    token_hash = hash_refresh_token(payload.refresh_token)

    db.query(RefreshToken).filter(RefreshToken.token_hash == token_hash).update(
        {"revoked": True}
    )
    db.commit()


@router.get("/me", response_model=AuthUserOut)
async def get_me(current_person: Person = Depends(get_current_person)):
    return AuthUserOut(
        national_id=current_person.national_id,
        full_name=current_person.full_name,
        mobile=current_person.mobile,
    )
