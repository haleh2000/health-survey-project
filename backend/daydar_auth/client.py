"""Thin HTTP client for the Daydar identity provider.

Mirrors the reference Go integration (qeireHozoriKhadamat-Day): partner/OAuth
calls (mobile, OTP, password, registration) are authenticated with the static
`key` header (server-to-server secret), while calls made *after* login
(fetching the user profile) are authenticated with the user's own Daydar
access token as a Bearer token. Daydar's envelope reports business errors via
`status`/`result` fields, not just the HTTP status code, so every response is
unwrapped through `_check_envelope` regardless of the HTTP status.
"""

from __future__ import annotations

import logging
from typing import Any

import httpx

from .config import daydar_settings

logger = logging.getLogger(__name__)


class DaydarError(Exception):
    def __init__(
        self,
        message: str,
        *,
        error_code: int | None = None,
        captcha: str | None = None,
        status_code: int = 400,
    ):
        super().__init__(message)
        self.message = message
        self.error_code = error_code
        self.captcha = captcha
        self.status_code = status_code


def _check_envelope(payload: dict[str, Any]) -> dict[str, Any]:
    status = payload.get("status")
    result = payload.get("result")

    if status is False or result is False:
        raise DaydarError(
            payload.get("message") or "خطا در ارتباط با سرویس احراز هویت دایدار.",
            error_code=payload.get("errorCode"),
            captcha=payload.get("captcha") or None,
        )

    return payload


class DaydarClient:
    def __init__(self) -> None:
        if not daydar_settings.enabled:
            logger.warning(
                "Daydar integration is not configured "
                "(DIDAR_BASE_URL / DIDAR_API_KEY missing); "
                "login requests will fail until it is."
            )

    def _require_configured(self) -> None:
        if not daydar_settings.enabled:
            raise DaydarError(
                "سرویس احراز هویت دیدار پیکربندی نشده است.", status_code=503
            )

    async def _post_auth(self, path: str, body: dict[str, Any]) -> dict[str, Any]:
        self._require_configured()

        async with httpx.AsyncClient(
            base_url=daydar_settings.base_url, timeout=daydar_settings.timeout
        ) as client:
            try:
                response = await client.post(
                    path,
                    json=body,
                    headers={
                        "key": daydar_settings.api_key,
                        "User-Agent": daydar_settings.user_agent,
                    },
                )
            except httpx.HTTPError as exc:
                logger.error("Daydar request to %s failed: %s", path, exc)
                raise DaydarError(
                    "ارتباط با سرویس احراز هویت دایدار برقرار نشد.", status_code=502
                ) from exc

        try:
            payload = response.json()
        except ValueError as exc:
            raise DaydarError(
                "پاسخ نامعتبر از سرویس احراز هویت دایدار دریافت شد.", status_code=502
            ) from exc

        return _check_envelope(payload)

    async def _get_bearer(self, path: str, token: str) -> dict[str, Any]:
        self._require_configured()

        async with httpx.AsyncClient(
            base_url=daydar_settings.base_url, timeout=daydar_settings.timeout
        ) as client:
            try:
                response = await client.get(
                    path,
                    headers={
                        "Authorization": f"Bearer {token}",
                        "User-Agent": daydar_settings.user_agent,
                    },
                )
            except httpx.HTTPError as exc:
                logger.error("Daydar request to %s failed: %s", path, exc)
                raise DaydarError(
                    "ارتباط با سرویس احراز هویت دایدار برقرار نشد.", status_code=502
                ) from exc

        try:
            payload = response.json()
        except ValueError as exc:
            raise DaydarError(
                "پاسخ نامعتبر از سرویس احراز هویت دایدار دریافت شد.", status_code=502
            ) from exc

        return _check_envelope(payload)

    # ---- OAuth / login -----------------------------------------------------

    async def start_mobile_login(
        self, mobile: str, captcha: str | None, session_id: str | None
    ) -> dict[str, Any]:
        body: dict[str, Any] = {"mobile": mobile}
        if captcha:
            body["captchaCode"] = captcha
        if session_id:
            body["sessionId"] = session_id
        return await self._post_auth(daydar_settings.mobile_path, body)

    async def send_otp(self, session_id: str) -> dict[str, Any]:
        return await self._post_auth(
            daydar_settings.otp_request_path, {"sessionId": session_id}
        )

    async def verify_otp(self, session_id: str, code: str) -> dict[str, Any]:
        return await self._post_auth(
            daydar_settings.otp_verify_path,
            {"sessionId": session_id, "OTP": code, "resetPassword": False},
        )

    async def login_with_password(
        self, session_id: str, password: str
    ) -> dict[str, Any]:
        return await self._post_auth(
            daydar_settings.password_path,
            {"sessionId": session_id, "password": password},
        )

    # ---- Registration -------------------------------------------------------

    async def verify_identity(
        self, session_id: str, national_id: str, birth_date: str
    ) -> dict[str, Any]:
        return await self._post_auth(
            daydar_settings.national_id_path,
            {
                "sessionId": session_id,
                "nationalId": national_id,
                "birthDate": birth_date,
            },
        )

    async def register(
        self, session_id: str, password: str, password_confirm: str
    ) -> dict[str, Any]:
        return await self._post_auth(
            daydar_settings.set_password_path,
            {
                "sessionId": session_id,
                "password": password,
                "passwordConfirm": password_confirm,
            },
        )

    # ---- Profile --------------------------------------------------------------

    async def fetch_profile(self, user_id: str, access_token: str) -> dict[str, Any]:
        path = f"{daydar_settings.user_profile_path}{user_id}"
        return await self._get_bearer(path, access_token)


daydar_client = DaydarClient()


def extract_daydar_tokens(payload: dict[str, Any]) -> tuple[str, str]:
    """Daydar returns the token pair flat on login, nested under `data` on register."""

    nested = payload.get("data") or {}
    access_token = payload.get("accessToken") or nested.get("accessToken")
    refresh_token = payload.get("refreshToken") or nested.get("refreshToken") or ""

    if not access_token:
        raise DaydarError(
            "پاسخ نامعتبر از سرویس احراز هویت دایدار دریافت شد.", status_code=502
        )

    return access_token, refresh_token
