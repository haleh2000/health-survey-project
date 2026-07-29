import {
  QuestionKind,
  type ChoiceOption,
  type Question,
} from "@survey/domain/entities/question.entity";
import {
  SurveyDefinition,
  type SurveyStep,
} from "@survey/domain/entities/survey-definition.entity";
import {
  BACKEND_KEYWORD,
  BACKEND_VALUE,
} from "@survey/infrastructure/contract/backend-contract";

/**
 * The questionnaire content.
 *
 * These strings are what the *user* reads. Where the backend expects different
 * wording for the same answer, the translation lives in
 * `mappers/backend-value.map.ts` — never by degrading the wording here.
 *
 * Two exceptions, flagged inline: `physical_activity` and `h_pylori` are
 * matched by the backend with a substring search rather than a lookup table,
 * so their wording must keep containing the keyword. `assertContractCoverage`
 * enforces that at startup.
 */

/** A plain option. */
const o = (value: string): ChoiceOption => ({ value });

/** A "none of the above" option: selecting it clears every other choice. */
const none = (value = "هیچکدام"): ChoiceOption => ({ value, exclusive: true });

/** The two values `YesNoEnum` accepts, in the order they read best. */
const yesNo: readonly ChoiceOption[] = [o(BACKEND_VALUE.no), o(BACKEND_VALUE.yes)];

const QUESTIONS: readonly Question[] = [
  // ── Step 1 · اطلاعات پایه ────────────────────────────────────────────────
  {
    id: "full_name",
    kind: QuestionKind.Text,
    title: "نام و نام خانوادگی",
    required: true,
    maxLength: 80,
    placeholder: "مثلاً مریم رضایی",
  },
  {
    id: "national_id",
    kind: QuestionKind.Text,
    title: "کد ملی",
    hint: "۱۰ رقم، بدون خط تیره. صحت آن پیش از ارسال بررسی می‌شود.",
    required: true,
    format: "national-id",
    placeholder: "۰۰۱۲۳۴۵۶۷۸",
  },
  {
    id: "gender",
    kind: QuestionKind.SingleChoice,
    title: "جنسیت",
    required: true,
    options: [o(BACKEND_VALUE.gender.male), o(BACKEND_VALUE.gender.female)],
  },
  {
    id: "birth_date",
    kind: QuestionKind.JalaliDate,
    title: "تاریخ تولد",
    hint: "به تاریخ شمسی وارد کنید.",
    required: true,
    minAge: 1,
    maxAge: 120,
  },
  {
    id: "height",
    kind: QuestionKind.Number,
    title: "قد",
    required: true,
    min: 80,
    max: 250,
    unit: "سانتی‌متر",
  },
  {
    id: "weight",
    kind: QuestionKind.Number,
    title: "وزن",
    required: true,
    min: 20,
    max: 300,
    unit: "کیلوگرم",
  },

  // ── Step 2 · سوابق پزشکی ────────────────────────────────────────────────
  {
    id: "confirmed_diseases",
    kind: QuestionKind.MultiChoice,
    title: "آیا پزشک تاکنون ابتلای شما به هر یک از بیماری‌های زیر را تایید کرده است؟",
    hint: "همه موارد صدق‌کننده را انتخاب کنید.",
    required: true,
    options: [
      o("دیابت (قند خون بالا)"),
      o("فشار خون بالا"),
      o("بیماری‌های قلبی (ایسکمیک، نارسایی)"),
      o("بیماری‌های تنفسی مزمن (آسم، برونشیت مزمن، COPD)"),
      o("التهاب مزمن پانکراس (پانکراتیت)"),
      o("بیماری کلیه یا مجاری ادراری"),
      o("بیماری غدد"),
      o("بیماری‌های خونی (کم‌خونی شدید، اختلالات خونی)"),
      o("بیماری‌های اعصاب و روان (افسردگی، اضطراب، اختلالات جدی)"),
      o("بیماری‌های استخوان، مفاصل یا عضلات (مزمن)"),
      o("بیماری‌های گوش، حلق، بینی یا چشمی مهم"),
      o("بیماری عفونی مهم (سل، هپاتیت B/C، HIV)"),
      none(),
    ],
  },
  {
    id: "h_pylori",
    kind: QuestionKind.SingleChoice,
    title: "آیا سابقه عفونت معده (هلیکوباکتر پیلوری) داشته‌اید؟",
    required: true,
    options: [
      o("خیر"),
      o("بله، اما درمان کامل شد"),
      // Interpolated, not spelled out, because processing.py detects an active
      // infection by searching this option for the keyword.
      o(`بله، و هنوز ${BACKEND_KEYWORD.activeHPylori} است یا درمان نشده`),
    ],
  },
  {
    id: "stroke_history",
    kind: QuestionKind.SingleChoice,
    title: "آیا تاکنون سابقه سکته داشته‌اید؟",
    required: true,
    options: [o("خیر"), o("بله، سکته قلبی"), o("بله، سکته مغزی")],
  },
  {
    id: "cancer_history",
    kind: QuestionKind.SingleChoice,
    title: "آیا تاکنون به هیچ نوع سرطانی مبتلا شده‌اید؟",
    required: true,
    options: yesNo,
  },
  {
    id: "cancer_types",
    kind: QuestionKind.MultiChoice,
    title: "نوع سرطان را مشخص کنید",
    required: true,
    visibleWhen: { questionId: "cancer_history", equals: BACKEND_VALUE.yes },
    options: [
      o("ریه"),
      o("معده"),
      o("روده بزرگ (کولون)"),
      o("پانکراس"),
      o("سینه"),
      o("پروستات"),
      o("رحم / دهانه رحم / تخمدان"),
      o("کبد"),
      o("سایر موارد"),
    ],
  },

  // ── Step 3 · سبک زندگی ──────────────────────────────────────────────────
  {
    id: "smoking_status",
    kind: QuestionKind.SingleChoice,
    title: "وضعیت مصرف سیگار",
    required: true,
    options: [
      o(BACKEND_VALUE.notASmoker),
      o("قبلاً می‌کشیدم اما ترک کردم"),
      o("هم‌اکنون سیگار می‌کشم"),
    ],
  },
  {
    id: "cigarettes_per_day",
    kind: QuestionKind.SingleChoice,
    title: "روزانه چند نخ سیگار می‌کشید؟",
    required: true,
    visibleWhen: { questionId: "smoking_status", equals: "هم‌اکنون سیگار می‌کشم" },
    options: [o("کمتر از ۱۰ نخ"), o("بین ۱۰ تا ۲۰ نخ"), o("بیشتر از ۲۰ نخ")],
  },
  {
    id: "hookah_ecig",
    kind: QuestionKind.SingleChoice,
    title: "آیا از قلیان یا سیگار الکترونیکی (ویپ) استفاده می‌کنید؟",
    required: true,
    options: yesNo,
  },
  {
    id: "alcohol",
    kind: QuestionKind.SingleChoice,
    title: "مصرف الکل شما در هفته چگونه است؟",
    required: true,
    options: [
      o("مصرف نمی‌کنم"),
      o("گهگاهی (کمتر از ۱ بار در هفته)"),
      o("منظم (بیشتر از ۱ بار در هفته یا مقادیر زیاد)"),
    ],
  },
  {
    id: "physical_activity",
    kind: QuestionKind.SingleChoice,
    title: "میزان فعالیت بدنی متوسط تا شدید شما در طول هفته چقدر است؟",
    hint: "فعالیتی که ضربان قلب را بالا ببرد.",
    required: true,
    options: [
      // Interpolated for the same reason: this is the option the backend
      // recognises as a sedentary lifestyle, by substring search.
      o(`${BACKEND_KEYWORD.lowPhysicalActivity} (کم‌تحرک)`),
      o("کمتر از ۲ ساعت در هفته"),
      o("بین ۲ تا ۴ ساعت در هفته"),
      o("بیشتر از ۴ ساعت در هفته"),
    ],
  },

  // ── Step 4 · عادات تغذیه‌ای ──────────────────────────────────────────────
  {
    id: "adds_salt",
    kind: QuestionKind.SingleChoice,
    title: "آیا معمولاً قبل از چشیدن غذا به آن نمک اضافه می‌کنید؟",
    required: true,
    options: yesNo,
  },
  {
    id: "hot_drink_temp",
    kind: QuestionKind.SingleChoice,
    title: "چای یا قهوه را معمولاً با چه دمایی می‌نوشید؟",
    required: true,
    options: [o("ولرم یا گرم معمولی"), o(BACKEND_VALUE.hotDrink.veryHot)],
  },
  {
    id: "junk_food",
    kind: QuestionKind.SingleChoice,
    title: "مصرف فست‌فود، غذاهای سرخ‌کردنی و چیپس/پفک در رژیم شما چقدر است؟",
    required: true,
    options: [
      o("کم (ماهیانه ۱-۲ بار)"),
      o("متوسط (هفته‌ای ۱-۲ بار)"),
      o("زیاد (بیشتر از ۳ بار در هفته)"),
    ],
  },
  {
    id: "processed_meat",
    kind: QuestionKind.SingleChoice,
    title: "مصرف گوشت‌های فرآوری‌شده (سوسیس، کالباس، همبرگر صنعتی) چقدر است؟",
    required: true,
    options: [
      o(BACKEND_VALUE.processedMeat.rare),
      o(BACKEND_VALUE.processedMeat.medium),
      o("زیاد (بیشتر از ۲-۳ وعده در هفته)"),
    ],
  },
  {
    id: "veg_fruit",
    kind: QuestionKind.SingleChoice,
    title: "مصرف روزانه میوه و سبزیجات شما چقدر است؟",
    required: true,
    options: [
      o("کمتر از ۱ واحد در روز"),
      o("۱ تا ۲ واحد در روز"),
      o("۳ واحد یا بیشتر در روز"),
    ],
  },
  {
    id: "smoked_food",
    kind: QuestionKind.SingleChoice,
    title:
      "آیا غذاهای دودی (مثل ماهی دودی، برنج دودی) یا ترشیجات بسیار شور زیاد مصرف می‌کنید؟",
    required: true,
    options: yesNo,
  },

  // ── Step 5 · سابقه خانوادگی و محیط ──────────────────────────────────────
  {
    id: "family_history",
    kind: QuestionKind.MultiChoice,
    title: "آیا در اقوام درجه یک (پدر، مادر، خواهر، برادر) سابقه بیماری‌های زیر وجود دارد؟",
    hint: "همه موارد صدق‌کننده را انتخاب کنید.",
    required: true,
    options: [
      o("سرطان ریه"),
      o("سرطان معده"),
      o("سرطان روده"),
      o("سرطان پانکراس"),
      o("سرطان کبد"),
      o("سرطان سینه"),
      o("سکته مغزی"),
      o("سکته قلبی"),
      none(),
    ],
  },
  {
    id: "occupational_hazard",
    kind: QuestionKind.SingleChoice,
    title: "آیا شغل شما در معرض گرد و غبار صنعتی، مواد شیمیایی یا آزبست است؟",
    required: true,
    options: yesNo,
  },
  {
    id: "air_pollution",
    kind: QuestionKind.SingleChoice,
    title: "آیا محل زندگی شما در منطقه‌ای با آلودگی هوای بالا قرار دارد؟",
    required: true,
    options: yesNo,
  },
  {
    id: "solid_fuel",
    kind: QuestionKind.SingleChoice,
    title:
      "آیا برای گرمایش یا پخت‌وپز در منزل از سوخت‌های جامد (چوب، زغال، فضولات حیوانی) استفاده می‌کنید؟",
    hint: "این پاسخ فعلاً در امتیاز بالینی لحاظ نمی‌شود.",
    required: true,
    options: yesNo,
  },
];

const STEPS: readonly SurveyStep[] = [
  {
    id: "identity",
    title: "اطلاعات پایه",
    description: "برای صدور نتیجه به نام و مشخصات پایه شما نیاز داریم.",
    questionIds: ["full_name", "national_id", "gender", "birth_date", "height", "weight"],
  },
  {
    id: "medical-history",
    title: "سوابق پزشکی",
    description: "سوابق تاییدشده توسط پزشک را انتخاب کنید.",
    questionIds: [
      "confirmed_diseases",
      "h_pylori",
      "stroke_history",
      "cancer_history",
      "cancer_types",
    ],
  },
  {
    id: "lifestyle",
    title: "سبک زندگی",
    description: "عادات روزمره‌ای که بیشترین اثر را بر ریسک بلندمدت دارند.",
    questionIds: [
      "smoking_status",
      "cigarettes_per_day",
      "hookah_ecig",
      "alcohol",
      "physical_activity",
    ],
  },
  {
    id: "nutrition",
    title: "عادات تغذیه‌ای",
    description: "الگوی معمول تغذیه شما در ماه‌های اخیر.",
    questionIds: [
      "adds_salt",
      "hot_drink_temp",
      "junk_food",
      "processed_meat",
      "veg_fruit",
      "smoked_food",
    ],
  },
  {
    id: "family-environment",
    title: "خانواده و محیط",
    description: "سابقه بستگان درجه یک و شرایط محیط کار و زندگی.",
    questionIds: ["family_history", "occupational_hazard", "air_pollution", "solid_fuel"],
  },
];

export const createSurveyDefinition = (): SurveyDefinition =>
  SurveyDefinition.create(STEPS, QUESTIONS);
