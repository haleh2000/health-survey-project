from pydantic import BaseModel


class MobileLoginRequest(BaseModel):
    mobile: str
    captcha: str | None = None
    session_id: str | None = None


class MobileLoginResponse(BaseModel):
    session_id: str
    captcha_required: bool = False
    captcha: str | None = None
    registered: bool | None = None


class SessionIdRequest(BaseModel):
    session_id: str


class OtpSendResponse(BaseModel):
    session_id: str
    expires_in: int | None = None


class OtpVerifyRequest(BaseModel):
    session_id: str
    code: str


class PasswordLoginRequest(BaseModel):
    session_id: str
    password: str


class VerifyIdentityRequest(BaseModel):
    session_id: str
    national_id: str
    # Jalali date, format YYYY/MM/DD (matches Daydar's expected format).
    birth_date: str


class VerifyIdentityResponse(BaseModel):
    session_id: str
    first_name: str
    last_name: str
    father_name: str | None = None
    national_id: str
    mobile: str | None = None


class RegisterRequest(BaseModel):
    session_id: str
    password: str
    password_confirm: str


class AuthUserOut(BaseModel):
    national_id: str
    full_name: str | None = None
    mobile: str | None = None


class AuthSessionOut(BaseModel):
    access_token: str
    access_token_expires_at: int
    refresh_token: str
    refresh_token_expires_at: int
    user: AuthUserOut


class RefreshRequest(BaseModel):
    refresh_token: str


class RefreshResponse(BaseModel):
    access_token: str
    access_token_expires_at: int


class LogoutRequest(BaseModel):
    refresh_token: str
