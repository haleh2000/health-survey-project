from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

import jwt as pyjwt

from database import get_db
from db_models import Person

from .security import decode_access_token


def get_current_person(
    authorization: str = Header(default=""),
    db: Session = Depends(get_db),
) -> Person:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="ورود به سامانه الزامی است.")

    token = authorization.removeprefix("Bearer ").strip()

    try:
        payload = decode_access_token(token)
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="نشست شما منقضی شده است.")
    except pyjwt.PyJWTError:
        raise HTTPException(status_code=401, detail="نشست نامعتبر است.")

    national_id = payload.get("sub")
    person = (
        db.query(Person).filter(Person.national_id == national_id).first()
        if national_id
        else None
    )

    if not person:
        raise HTTPException(status_code=401, detail="کاربر یافت نشد.")

    return person
