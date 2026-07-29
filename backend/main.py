import asyncio
import os
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from models import SurveyInput, RiskResponse
from processing import calculate_risk_sync
from fastapi_swagger import patch_fastapi
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

app = FastAPI(docs_url=None, swagger_ui_oauth2_redirect_url=None)
patch_fastapi(app, docs_url="/swagger")

# The SPA is served from a different origin than the API, so without this the
# browser blocks every request before it reaches FastAPI. Defaults cover the
# Vite dev server; set CORS_ALLOW_ORIGINS (comma separated) in production.
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ALLOW_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.error(f"Validation error on {request.url}: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={"detail": "خطا در ورود داده‌ها: لطفا ورودی‌ها را بررسی کنید.", "errors": exc.errors()}
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unexpected error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "خطای داخلی سرور رخ داده است. لطفا مجددا تلاش کنید."}
    )

@app.post("/calculate_risk", response_model=RiskResponse)
async def get_risk_score(data: SurveyInput):
    """
    Endpoint is now asynchronous. Processing is offloaded to a separate thread 
    to prevent blocking the main event loop during concurrent requests.
    """
    try:
        result_dict = await asyncio.to_thread(calculate_risk_sync, data)
        return RiskResponse(**result_dict)

    except Exception as e:
        logger.error(f"Error calculating risk score: {e}")
        raise HTTPException(status_code=400, detail="خطا در پردازش اطلاعات کاربر.")
