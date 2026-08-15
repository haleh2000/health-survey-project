// src/modules/recommendations/adviceContent.ts
import { RiskTier } from "@survey/domain/entities/risk-assessment.entity";


export type AdviceSectionId = "mind-peace" | "nutrition" | "weight-loss";

export interface AdviceSectionContent {
  id: AdviceSectionId;
  title: string;
  description: string;
  scaleQuestion: string;
  scaleOptions: { value: number; label: string }[];
  maxScaleSelections: number;
  dailyPromptLabel: string;
  moodEmojis: string[];
}

const SCALE_OPTIONS = [
  { value: 1, label: "هرگز" },
  { value: 2, label: "خیلی کم" },
  { value: 3, label: "کم" },
  { value: 4, label: "متوسط" },
  { value: 5, label: "زیاد" },
  { value: 6, label: "خیلی زیاد" },
  { value: 7, label: "همیشه" },
];
const MOOD_EMOJIS = ["😞", "😕", "😐", "🙂", "😄"];

type TieredFields = Pick<AdviceSectionContent, "description" | "scaleQuestion" | "dailyPromptLabel">;

const BASE_CONTENT: Record<AdviceSectionId, Omit<AdviceSectionContent, "description" | "scaleQuestion" | "dailyPromptLabel">> = {
  "mind-peace": {
    id: "mind-peace",
    title: "پیشنهادات آرامش ذهن و خودمراقبتی",
    scaleOptions: SCALE_OPTIONS,
    maxScaleSelections: 3,
    moodEmojis: MOOD_EMOJIS,
  },
  nutrition: {
    id: "nutrition",
    title: "پیشنهادات تغذیه",
    scaleOptions: SCALE_OPTIONS,
    maxScaleSelections: 3,
    moodEmojis: MOOD_EMOJIS,
  },
  "weight-loss": {
    id: "weight-loss",
    title: "پیشنهادات کاهش وزن",
    scaleOptions: SCALE_OPTIONS,
    maxScaleSelections: 3,
    moodEmojis: MOOD_EMOJIS,
  },
};

const TIERED_ADVICE_OVERRIDES: Record<AdviceSectionId, Record<RiskTier, TieredFields>> = {
  "mind-peace": {
    critical: {
      description: "وضعیت ذهنی‌ات نیاز فوری به توجه دارد. هر روز حداقل ۱۰ دقیقه تنفس عمیق یا مدیتیشن را جدی بگیر و در صورت امکان با یک متخصص صحبت کن.",
      scaleQuestion: "این هفته چقدر برای کاهش استرس و آرامش ذهنی اقدام کردی؟",
      dailyPromptLabel: "امروز چه کاری برای کاهش فشار ذهنی انجام دادی؟",
    },
    elevated: {
      description: "سطح استرست بالاست. روزانه چند دقیقه را به سکوت، قدم زدن یا نوشتن احساساتت اختصاص بده.",
      scaleQuestion: "این هفته چقدر برای مدیریت استرس خودت وقت گذاشتی؟",
      dailyPromptLabel: "امروز چه کاری برای آرام کردن ذهنت کردی؟",
    },
    moderate: {
      description: "هر روز چند دقیقه را به خودت اختصاص بده؛ با شمع، دفترچه یادداشت یا چند دقیقه سکوت.",
      scaleQuestion: "این هفته چقدر برای آرامش ذهنی خودت وقت گذاشتی؟",
      dailyPromptLabel: "امروز چه کاری برای آرامش ذهنت انجام دادی؟",
    },
    low: {
      description: "وضعیت ذهنی‌ات خوبه. برای حفظ این تعادل، عادت‌های مثبتت را ادامه بده و از لحظه‌های آرامش لذت ببر.",
      scaleQuestion: "این هفته چقدر از آرامش ذهنی‌ات راضی بودی؟",
      dailyPromptLabel: "امروز چه چیزی باعث آرامشت شد؟",
    },
  },
  nutrition: {
    critical: {
      description: "تغذیه‌ات نیاز فوری به اصلاح دارد. مصرف غذاهای فرآوری‌شده را به حداقل برسان و با یک متخصص تغذیه مشورت کن.",
      scaleQuestion: "این هفته چقدر به اصلاح رژیم غذایی‌ات توجه کردی؟",
      dailyPromptLabel: "امروز چه تغییری در تغذیه‌ات دادی؟",
    },
    elevated: {
      description: "وعده‌های غذایی‌ات را منظم کن، قند و چربی اشباع را کاهش بده و سبزیجات بیشتری به رژیمت اضافه کن.",
      scaleQuestion: "این هفته چقدر به بهبود تغذیه‌ات پایبند بودی؟",
      dailyPromptLabel: "امروز چه وعده سالم‌تری نسبت به دیروز خوردی؟",
    },
    moderate: {
      description: "وعده‌های غذایی متعادل شامل پروتئین، غلات کامل و سبزیجات را در برنامه هفتگی‌ات بگنجان.",
      scaleQuestion: "این هفته چقدر به برنامه تغذیه سالم پایبند بودی؟",
      dailyPromptLabel: "امروز چه وعده سالمی خوردی؟",
    },
    low: {
      description: "تغذیه‌ات در مسیر خوبیه. تنوع غذایی را حفظ کن و از خوردن میوه و سبزیجات فصلی غافل نشو.",
      scaleQuestion: "این هفته چقدر از کیفیت تغذیه‌ات راضی بودی؟",
      dailyPromptLabel: "امروز چه غذای مغذی‌ای خوردی؟",
    },
  },
  "weight-loss": {
    critical: {
      description: "وزن بدنت به توجه جدی نیاز دارد. با پزشک یا متخصص تغذیه مشورت کن و از شروع هر برنامه‌ای بدون راهنمایی متخصص خودداری کن.",
      scaleQuestion: "این هفته چقدر برای مدیریت وزنت اقدام کردی؟",
      dailyPromptLabel: "امروز چه قدمی برای سلامت وزنت برداشتی؟",
    },
    elevated: {
      description: "فعالیت بدنی روزانه را افزایش بده، مصرف قند را کاهش بده و وعده‌های کوچک‌تر اما منظم‌تر داشته باش.",
      scaleQuestion: "این هفته چقدر به برنامه کاهش وزن پایبند بودی؟",
      dailyPromptLabel: "امروز چه فعالیتی برای کنترل وزنت انجام دادی؟",
    },
    moderate: {
      description: "نوشیدن آب کافی، مصرف میوه و فعالیت روزانه سبک را فراموش نکن.",
      scaleQuestion: "این هفته چقدر به برنامه کاهش وزن پایبند بودی؟",
      dailyPromptLabel: "امروز چه فعالیتی برای کاهش وزن انجام دادی؟",
    },
    low: {
      description: "وزنت در محدوده مناسبیه. برای حفظ این وضعیت، تحرک روزانه و تغذیه متعادل را ادامه بده.",
      scaleQuestion: "این هفته چقدر از وضعیت وزنت راضی بودی؟",
      dailyPromptLabel: "امروز چه کاری برای حفظ وزن سالمت کردی؟",
    },
  },
};

export function getAdviceContent(id: AdviceSectionId, tier: RiskTier): AdviceSectionContent {
  return { ...BASE_CONTENT[id], ...TIERED_ADVICE_OVERRIDES[id][tier] };
}
