import asyncio
import os
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.orm import Session

from models import SurveyInput, RiskResponse
from processing import calculate_risk_sync
from database import init_db, get_db, check_connection
from db_models import Person, SurveySubmission
from fastapi_swagger import patch_fastapi


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    check_connection()
    init_db()
    logger.info("Database tables verified/created.")
    yield


app = FastAPI(
    docs_url=None,
    swagger_ui_oauth2_redirect_url=None,
    lifespan=lifespan,
)

patch_fastapi(app, docs_url="/swagger")


ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ALLOW_ORIGINS",
        "http://localhost:5173,"
        "http://localhost:5174,"
        "http://localhost:5175,"
        "http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
):
    logger.error(
        f"Validation error on {request.url}: {exc.errors()}"
    )

    return JSONResponse(
        status_code=422,
        content={
            "detail": "خطا در ورود داده‌ها: لطفا ورودی‌ها را بررسی کنید.",
            "errors": exc.errors(),
        },
    )


@app.exception_handler(Exception)
async def generic_exception_handler(
    request: Request,
    exc: Exception,
):
    logger.error(
        f"Unexpected error: {exc}",
        exc_info=True,
    )

    return JSONResponse(
        status_code=500,
        content={
            "detail": "خطای داخلی سرور رخ داده است. لطفا مجددا تلاش کنید."
        },
    )


@app.post("/calculate_risk", response_model=RiskResponse)
async def get_risk_score(
    data: SurveyInput,
    db: Session = Depends(get_db),
):
    try:
        # ---------------------------------------------------------
        # 1. Calculate risk
        # ---------------------------------------------------------
        result_dict = await asyncio.to_thread(
            calculate_risk_sync,
            data,
        )

        national_id = data.national_id

        gender = (
            data.gender.value
            if hasattr(data.gender, "value")
            else data.gender
        )

        birth_date = data.birth_date
        full_name = data.full_name

        # ---------------------------------------------------------
        # 2. Find or create Person
        # ---------------------------------------------------------
        person = (
            db.query(Person)
            .filter(Person.national_id == national_id)
            .first()
        )

        if person:
            # Update only if new data is available
            if full_name and not person.full_name:
                person.full_name = full_name

            if gender and not person.gender:
                person.gender = gender

            if birth_date and not person.birth_date:
                person.birth_date = birth_date

        else:
            person = Person(
                national_id=national_id,
                full_name=full_name,
                gender=gender,
                birth_date=birth_date,
            )

            db.add(person)
            db.flush()

        # ---------------------------------------------------------
        # 3. Create assessment
        # ---------------------------------------------------------
        submission = SurveySubmission(
            person_national_id=person.national_id,

            height=data.height,
            weight=data.weight,

            smoking_status=data.smoking_status,
            cigarettes_per_day=data.cigarettes_per_day,

            hookah_ecig=(
                data.hookah_ecig.value
                if hasattr(data.hookah_ecig, "value")
                else data.hookah_ecig
            ),

            alcohol=(
                data.alcohol.value
                if hasattr(data.alcohol, "value")
                else data.alcohol
            ),

            adds_salt=(
                data.adds_salt.value
                if hasattr(data.adds_salt, "value")
                else data.adds_salt
            ),

            hot_drink_temp=(
                data.hot_drink_temp.value
                if hasattr(data.hot_drink_temp, "value")
                else data.hot_drink_temp
            ),

            junk_food=(
                data.junk_food.value
                if hasattr(data.junk_food, "value")
                else data.junk_food
            ),

            processed_meat=(
                data.processed_meat.value
                if hasattr(data.processed_meat, "value")
                else data.processed_meat
            ),

            veg_fruit=(
                data.veg_fruit.value
                if hasattr(data.veg_fruit, "value")
                else data.veg_fruit
            ),

            smoked_food=(
                data.smoked_food.value
                if hasattr(data.smoked_food, "value")
                else data.smoked_food
            ),

            air_pollution=(
                data.air_pollution.value
                if hasattr(data.air_pollution, "value")
                else data.air_pollution
            ),

            occupational_hazard=(
                data.occupational_hazard.value
                if hasattr(data.occupational_hazard, "value")
                else data.occupational_hazard
            ),

            physical_activity=data.physical_activity,

            confirmed_diseases=data.confirmed_diseases,
            stroke_history=data.stroke_history,

            h_pylori=data.h_pylori,

            cancer_history=(
                data.cancer_history.value
                if hasattr(data.cancer_history, "value")
                else data.cancer_history
            ),

            cancer_types=data.cancer_types or [],
            family_history=data.family_history,

            # Calculated values
            age=result_dict["age"],
            bmi=result_dict["bmi"],
            risk_score=result_dict["risk_score"],
            risk_level=result_dict["risk_level"],

            lung_risk=result_dict["lung_risk"],
            gastric_risk=result_dict["gastric_risk"],
            colon_risk=result_dict["colon_risk"],
            pancreas_risk=result_dict["pancreas_risk"],
            stroke_risk=result_dict["stroke_risk"],
            cardiac_risk=result_dict["cardiac_risk"],
            metabolic_risk=result_dict["metabolic_risk"],
            liver_risk=result_dict["liver_risk"],

            flags=result_dict["flags"],
        )

        db.add(submission)

        # ---------------------------------------------------------
        # 4. Save everything
        # ---------------------------------------------------------
        db.commit()
        db.refresh(submission)

        logger.info(
            f"Saved assessment id={submission.id} "
            f"for national_id={national_id}"
        )

        return RiskResponse(**result_dict)

    except Exception as e:
        db.rollback()

        logger.error(
            f"Error calculating risk score: {e}",
            exc_info=True,
        )

        raise HTTPException(
            status_code=400,
            detail="خطا در پردازش اطلاعات کاربر.",
        )


@app.get("/persons/{national_id}")
async def get_person(
    national_id: str,
    db: Session = Depends(get_db),
):
    person = (
        db.query(Person)
        .filter(Person.national_id == national_id)
        .first()
    )

    if not person:
        raise HTTPException(
            status_code=404,
            detail="شخص یافت نشد.",
        )

    return {
        "national_id": person.national_id,
        "full_name": person.full_name,
        "gender": person.gender,
        "birth_date": person.birth_date,
        "created_at": person.created_at.isoformat(),
        "updated_at": person.updated_at.isoformat(),
    }


@app.get("/persons/{national_id}/submissions")
async def get_person_submissions(
    national_id: str,
    db: Session = Depends(get_db),
):
    person = (
        db.query(Person)
        .filter(Person.national_id == national_id)
        .first()
    )

    if not person:
        raise HTTPException(
            status_code=404,
            detail="شخص یافت نشد.",
        )

    submissions = (
        db.query(SurveySubmission)
        .filter(
            SurveySubmission.person_national_id == national_id
        )
        .order_by(
            SurveySubmission.created_at.desc()
        )
        .all()
    )

    return [
        {
            "id": submission.id,
            "person_national_id": submission.person_national_id,
            "risk_score": submission.risk_score,
            "risk_level": submission.risk_level,
            "bmi": submission.bmi,
            "age": submission.age,
            "created_at": submission.created_at.isoformat(),
        }
        for submission in submissions
    ]


@app.get("/submissions/{national_id}")
async def get_submissions(
    national_id: str,
    db: Session = Depends(get_db),
):
    rows = (
        db.query(SurveySubmission)
        .filter(
            SurveySubmission.person_national_id == national_id
        )
        .order_by(
            SurveySubmission.created_at.desc()
        )
        .all()
    )

    if not rows:
        raise HTTPException(
            status_code=404,
            detail="هیچ سابقه‌ای یافت نشد.",
        )

    return [
        {
            "id": row.id,
            "risk_score": row.risk_score,
            "risk_level": row.risk_level,
            "bmi": row.bmi,
            "created_at": row.created_at.isoformat(),
        }
        for row in rows
    ]