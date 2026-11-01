import os


def _get(name: str, default: str = "") -> str:
    return os.getenv(name, default)


def _flag(name: str, default: str = "") -> bool:
    return _get(name, default).strip().lower() in {"1", "true", "yes", "on"}


class DaydarSettings:
    base_url: str = _get("DIDAR_BASE_URL")
    api_key: str = _get("DIDAR_API_KEY")
    user_agent: str = _get("DIDAR_USER_AGENT", "health-survey-project/1.0")
    timeout: float = float(_get("DIDAR_TIMEOUT", "8"))

    mobile_path: str = _get("DIDAR_OTP_MOBILE_PATH", "/api/NewAccessManagement/OAuth/mobile")
    password_path: str = _get("DIDAR_PASSWORD_PATH", "/api/NewAccessManagement/OAuth/login")
    otp_request_path: str = _get("DIDAR_OTP_REQUEST_PATH", "/api/NewAccessManagement/OAuth/OTP/request")
    otp_verify_path: str = _get("DIDAR_OTP_VERIFY_PATH", "/api/NewAccessManagement/OAuth/OTP/submit")
    national_id_path: str = _get("DIDAR_NATIONAL_ID_PATH", "/api/NewAccessManagement/OAuth/setNationalId")
    set_password_path: str = _get("DIDAR_SET_PASSWORD_PATH", "/api/NewAccessManagement/OAuth/setPassword")
    user_profile_path: str = _get(
        "DIDAR_USER_PROFILE_PATH", "/api/AccessManagement/userManagement/users/"
    )

    @property
    def enabled(self) -> bool:
        return bool(self.base_url and self.api_key)

    @property
    def local_login_enabled(self) -> bool:
        """Password-less local login, used only for development.

        Never active while the Didar SSO is configured, so it cannot
        shadow the real identity provider, and only when it is
        explicitly opted into with ALLOW_LOCAL_LOGIN: a deployment
        that simply forgot the Didar keys keeps failing loudly on the
        SSO routes instead of silently accepting logins.
        """

        return ALLOW_LOCAL_LOGIN and not self.enabled


ALLOW_LOCAL_LOGIN = _flag("ALLOW_LOCAL_LOGIN")


daydar_settings = DaydarSettings()


JWT_SECRET_KEY = _get("JWT_SECRET_KEY")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_LIFETIME_MINUTES = int(_get("ACCESS_TOKEN_LIFETIME_MINUTES", "30"))
REFRESH_TOKEN_LIFETIME_DAYS = int(_get("REFRESH_TOKEN_LIFETIME_DAYS", "30"))
