

import type { QuestionId } from "@survey/domain/entities/question.entity";

/** Questions the backend has no field for. Collected, never submitted. */
export const UNMAPPED_QUESTIONS = ["solid_fuel"] as const satisfies readonly QuestionId[];

export type SubmittedQuestionId = Exclude<
  QuestionId,
  (typeof UNMAPPED_QUESTIONS)[number]
>;

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


export const RESPONSE_FIELD_ALIAS = {
  name: "نام",
  national_id: "کد_ملی",
  age: "سن",
  risk_score: "نمره_ریسک",
  risk_level: "سطح_ریسک",
} as const;

export const BACKEND_VALUE = {
  yes: "بله",
  no: "خیر",

  gender: {
    male: "مرد",
    female: "زن", 
  },

  alcohol: {
    none: "الکل مصرف نمی‌کنم",
    occasional: "مصرف گهگاهی (کمتر از ۱بار در هفته)",
    regular: "مصرف منظم (بیشتر از ۱بار در هفته یا مقادیر زیاد)",
  },

  hotDrink: {
    veryHot: "بسیار داغ",
    warm: "گرم",
  },

  junkFood: {
    low: "کم (ماهیانه 1-2 بار)",
    medium: "متوسط (هفته‌ای 1-2 بار)",
    high: "زیاد (بیشتر از ۳بار در هفته)",
  },

  processedMeat: {
    rare: "به ندرت یا هرگز",
    medium: "متوسط",
    high: "زیاد (بیشتر از 2-3 وعده در هفته)",
  },

  vegFruit: {
    low: "کمتر از ۱ واحد در روز",
    medium: "۱تا ۲ واحد در روز",
    high: "۳ واحد یا بیشتر در روز",
  },

  notASmoker: "اصلاً سیگار نمی‌کشم",

  cigarettesPerDay: {
    under10: "کمتر از ۱۰ نخ",
    between10And20: "بین ۱۰تا ۲۰ نخ",
    over20: "بیشتر از 20 نخ",
  },
} as const;

export const BACKEND_KEYWORD = {
  lowPhysicalActivity: "فعالیت خاصی ندارم",
  activeHPylori: "فعال",
} as const;

export const RISK_LEVEL_LABEL = {
  critical: "گروه ۱: گروه پر ریسک (با بیماری قطعی یا امتیاز بالا)",
  elevated: "گروه ۲: گروه در آستانه خطر (کوتاه‌مدت)",
  moderate: "گروه ۳: گروه در معرض خطر (بلندمدت)",
  low: "گروه ۴: گروه افراد سالم",
} as const;
