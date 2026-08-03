

import type { QuestionId } from "@survey/domain/entities/question.entity";

/** Questions the backend has no field for. Collected, never submitted. */
export const UNMAPPED_QUESTIONS = ["solid_fuel"] as const satisfies readonly QuestionId[];

export type SubmittedQuestionId = Exclude<
  QuestionId,
  (typeof UNMAPPED_QUESTIONS)[number]
>;

/**
 * Request body keys. `SurveyInput` does not set `populate_by_name`, so these
 * Persian aliases are the *only* accepted keys — English names are rejected
 * with a 422. Typed as an exhaustive record, so adding a question to
 * `QuestionId` fails the build until its alias is declared here.
 */
export const REQUEST_FIELD_ALIAS: Record<SubmittedQuestionId, string> = {
  full_name: "نام و نام خانوادگی",
  national_id: "کد ملی",
  gender: "جنسیت",
  birth_date: "تاریخ تولد",
  height: "قد (سانتی متر)",
  weight: "وزن (کیلوگرم)",
  smoking_status: "آیا از سیگار استفاده می‌کنید؟",
  cigarettes_per_day: "روزانه چند نخ سیگار می‌کشید؟",
  hookah_ecig: "آیا از قلیان یا سیگار الکترونیکی (ویپ) استفاده می‌کنید؟",
  alcohol: "مصرف الکل شما در هفته چگونه است؟",
  adds_salt: "آیا معمولاً قبل از چشیدن غذا به آن نمک اضافه می‌کنید؟",
  hot_drink_temp: "چای یا قهوه را معمولاً با چه دمایی می‌نوشید؟",
  junk_food: "مصرف فست فود، غذاهای سرخ کردنی و چیپس/پفک در رژیم شما چقدر است؟",
  processed_meat: "مصرف گوشت‌های فرآوری شده (سوسیس، کالباس، همبرگر صنعتی) چقدر است؟",
  veg_fruit: "مصرف روزانه میوه و سبزیجات شما چقدر است؟",
  smoked_food: "آیا غذاهای دودی (مثل ماهی دودی، برنج دودی) یا ترشیجات بسیار شور زیاد مصرف می‌کنید؟",
  air_pollution: "آیا محل زندگی شما در منطقه با آلودگی هوا قرار دارد؟",
  occupational_hazard: "آیا شغل شما در معرض گرد و غبار صنعتی، مواد شیمیایی یا آزبست است؟",
  physical_activity: "میزان فعالیت بدنی متوسط تا شدید شما در طول هفته چقدر است؟ (فعالیتی که ضربان قلب را بالا ببرد)",
  confirmed_diseases: "آیا پزشک تاکنون ابتلای شما به هر یک از بیماری‌های زیر را تایید کرده است؟",
  stroke_history: "آیا تا کنون سابقه سکته داشته‌اید؟",
  h_pylori: "آیا سابقه عفونت معده (هلیکوباکتر پیلوری) داشته‌اید؟",
  cancer_history: "آیا تا کنون به هیچ نوع سرطانی مبتلا شده‌اید؟",
  cancer_types: "نوع سرطان را مشخص کنید:",
  family_history: "آیا در اقوام درجه یک (پدر، مادر، خواهر، برادر) سابقه بیماری‌های زیر وجود دارد؟",
};

/** Response body keys, from `RiskResponse.serialization_alias`. */
export const RESPONSE_FIELD_ALIAS = {
  name: "نام",
  national_id: "کد_ملی",
  age: "سن",
  risk_score: "نمره_ریسک",
  risk_level: "سطح_ریسک",
} as const;

/**
 * Values the backend accepts. Anything enum-typed in models.py rejects an
 * unlisted value with a 422; the rest are looked up in a dict and silently
 * score zero, which is the more dangerous failure of the two.
 */
export const BACKEND_VALUE = {
  /** YesNoEnum — used by seven different questions. */
  yes: "بله",
  no: "خیر",

  gender: {
    male: "مرد",
    female: "زن",
  },

  /** AlcoholEnum. */
  alcohol: {
    none: "الکل مصرف نمی‌کنم",
    occasional: "مصرف گهگاهی (کمتر از ۱بار در هفته)",
    regular: "مصرف منظم (بیشتر از ۱بار در هفته یا مقادیر زیاد)",
  },

  /** HotDrinkEnum — note the backend only has two levels. */
  hotDrink: {
    veryHot: "بسیار داغ",
    warm: "گرم",
  },

  /** JunkFoodEnum — ASCII digits in the first two, Persian in the third. */
  junkFood: {
    low: "کم (ماهیانه 1-2 بار)",
    medium: "متوسط (هفته‌ای 1-2 بار)",
    high: "زیاد (بیشتر از ۳بار در هفته)",
  },

  /** ProcessedMeatEnum. */
  processedMeat: {
    rare: "به ندرت یا هرگز",
    medium: "متوسط",
    high: "زیاد (بیشتر از 2-3 وعده در هفته)",
  },

  /** VegFruitEnum. */
  vegFruit: {
    low: "کمتر از ۱ واحد در روز",
    medium: "۱تا ۲ واحد در روز",
    high: "۳ واحد یا بیشتر در روز",
  },

  /** SmokingStatusEnum.NONE — the only value processing.py compares against. */
  notASmoker: "اصلاً سیگار نمی‌کشم",

  /** CIGARETTE_MAP keys. Free-form strings, so a mismatch scores zero. */
  cigarettesPerDay: {
    under10: "کمتر از ۱۰ نخ",
    between10And20: "بین ۱۰تا ۲۰ نخ",
    over20: "بیشتر از 20 نخ",
  },
} as const;

/**
 * Substrings `processing.py` searches for with `in`. The UI wording for the
 * matching options must contain these verbatim, which
 * `assertContractCoverage` checks at startup.
 */
export const BACKEND_KEYWORD = {
  lowPhysicalActivity: "فعالیت خاصی ندارم",
  activeHPylori: "فعال",
} as const;

/** The four labels `risk_level` can hold, from config.py. */
export const RISK_LEVEL_LABEL = {
  critical: "گروه ۱: گروه پر ریسک (با بیماری قطعی یا امتیاز بالا)",
  elevated: "گروه ۲: گروه در آستانه خطر (کوتاه‌مدت)",
  moderate: "گروه ۳: گروه در معرض خطر (بلندمدت)",
  low: "گروه ۴: گروه افراد سالم",
} as const;
