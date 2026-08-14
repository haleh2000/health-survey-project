# models.py
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from enums import (
    YesNoEnum, GenderEnum, SmokingStatusEnum, AlcoholEnum,
    JunkFoodEnum, ProcessedMeatEnum, VegFruitEnum, HotDrinkEnum
)

class SurveyInput(BaseModel):
    # ... (بدون تغییر)
    full_name: str = Field(alias="نام و نام خانوادگی")
    national_id: str = Field(alias="کد ملی")
    gender: GenderEnum = Field(alias="جنسیت")
    birth_date: str = Field(alias="تاریخ تولد")
    height: float = Field(gt=0, alias="قد (سانتی متر)")
    weight: float = Field(gt=0, alias="وزن (کیلوگرم)")
    smoking_status: str = Field(alias="آیا از سیگار استفاده می‌کنید؟")
    cigarettes_per_day: Optional[str] = Field(default="0", alias="روزانه چند نخ سیگار می‌کشید؟")
    hookah_ecig: YesNoEnum = Field(alias="آیا از قلیان یا سیگار الکترونیکی (ویپ) استفاده می‌کنید؟")
    alcohol: AlcoholEnum = Field(alias="مصرف الکل شما در هفته چگونه است؟")
    adds_salt: YesNoEnum = Field(alias="آیا معمولاً قبل از چشیدن غذا به آن نمک اضافه می‌کنید؟")
    hot_drink_temp: HotDrinkEnum = Field(alias="چای یا قهوه را معمولاً با چه دمایی می‌نوشید؟")
    junk_food: JunkFoodEnum = Field(alias="مصرف فست فود، غذاهای سرخ کردنی و چیپس/پفک در رژیم شما چقدر است؟")
    processed_meat: ProcessedMeatEnum = Field(alias="مصرف گوشت‌های فرآوری شده (سوسیس، کالباس، همبرگر صنعتی) چقدر است؟")
    veg_fruit: VegFruitEnum = Field(alias="مصرف روزانه میوه و سبزیجات شما چقدر است؟")
    smoked_food: YesNoEnum = Field(alias="آیا غذاهای دودی (مثل ماهی دودی، برنج دودی) یا ترشیجات بسیار شور زیاد مصرف می‌کنید؟")
    air_pollution: YesNoEnum = Field(alias="آیا محل زندگی شما در منطقه با آلودگی هوا قرار دارد؟")
    occupational_hazard: YesNoEnum = Field(alias="آیا شغل شما در معرض گرد و غبار صنعتی، مواد شیمیایی یا آزبست است؟")
    physical_activity: str = Field(alias="میزان فعالیت بدنی متوسط تا شدید شما در طول هفته چقدر است؟ (فعالیتی که ضربان قلب را بالا ببرد)")
    confirmed_diseases: List[str] = Field(alias="آیا پزشک تاکنون ابتلای شما به هر یک از بیماری‌های زیر را تایید کرده است؟")
    stroke_history: List[str] = Field(alias="آیا تا کنون سابقه سکته داشته‌اید؟")
    h_pylori: str = Field(alias="آیا سابقه عفونت معده (هلیکوباکتر پیلوری) داشته‌اید؟")
    cancer_history: YesNoEnum = Field(alias="آیا تا کنون به هیچ نوع سرطانی مبتلا شده‌اید؟")
    cancer_types: Optional[List[str]] = Field(default=[], alias="نوع سرطان را مشخص کنید:")
    family_history: List[str] = Field(alias="آیا در اقوام درجه یک (پدر، مادر، خواهر، برادر) سابقه بیماری‌های زیر وجود دارد؟")


class RiskResponse(BaseModel):
    name: str = Field(serialization_alias="نام")
    national_id: str = Field(serialization_alias="کد_ملی")
    age: int = Field(serialization_alias="سن")
    risk_score: float = Field(serialization_alias="نمره_ریسک")
    risk_level: str = Field(serialization_alias="سطح_ریسک")
    bmi: float = Field(serialization_alias="bmi")
    # Organ risk scores
    lung_risk: int = Field(serialization_alias="lung_risk")
    gastric_risk: int = Field(serialization_alias="gastric_risk")
    colon_risk: int = Field(serialization_alias="colon_risk")
    pancreas_risk: int = Field(serialization_alias="pancreas_risk")
    stroke_risk: int = Field(serialization_alias="stroke_risk")
    cardiac_risk: int = Field(serialization_alias="cardiac_risk")
    metabolic_risk: int = Field(serialization_alias="metabolic_risk")
    liver_risk: int = Field(serialization_alias="liver_risk")
    # Causal flags for frontend rendering
    flags: Dict[str, bool] = Field(serialization_alias="flags")
