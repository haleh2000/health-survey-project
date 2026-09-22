"""Our own session tokens.

Daydar's access token is only ever used server-side (to call Daydar's profile
endpoint right after login) and is never stored or returned to the browser.
Once we know who the user is, we mint our own short-lived JWT access token
plus an opaque, DB-backed refresh token — same separation the reference
project makes between "Daydar's session" and "our session".
"""

from __future__ import annotations

import hashlib
import secrets
from datetime import datetime, timedelta, timezone

import jwt

from .config import (
    ACCESS_TOKEN_LIFETIME_MINUTES,
    JWT_ALGORITHM,
    JWT_SECRET_KEY,
    REFRESH_TOKEN_LIFETIME_DAYS,
)

if not JWT_SECRET_KEY:
    raise RuntimeError("JWT_SECRET_KEY environment variable is not set")


def create_access_token(national_id: str, full_name: str) -> tuple[str, datetime]:
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_LIFETIME_MINUTES
    )
    payload = {
        "sub": national_id,
        "full_name": full_name,
        "exp": expires_at,
        "type": "access",
    }
    token = jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return token, expires_at


def decode_access_token(token: str) -> dict:
    return jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])


def generate_refresh_token() -> str:
    return secrets.token_urlsafe(48)


def hash_refresh_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def refresh_token_expiry() -> datetime:
    return datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_LIFETIME_DAYS)
