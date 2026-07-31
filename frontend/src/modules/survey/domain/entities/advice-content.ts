export type WeekDay = "ش" | "ی" | "د" | "س" | "چ" | "پ" | "ج";

export const WEEK_DAYS: WeekDay[] = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

export interface ScaleOption {
  value: number;
  label: string;
}

export interface AdviceSectionContent {
  id: "mind-peace" | "nutrition" | "weight-loss";
  title: string;
  description: string;
  scaleQuestion: string;
  scaleOptions: ScaleOption[];
  maxScaleSelections: number;
  dailyPromptLabel: string;
  moodEmojis: string[];
}

export const MIND_PEACE_CONTENT: AdviceSectionContent = {
  id: "mind-peace",
  title: "پیشنهادات آرامش ذهن و خودمراقبتی",
  description:
    "هر روز چند دقیقه را به خودت اختصاص بده؛ با شمع، دفترچه یادداشت یا چند دقیقه سکوت.",
  scaleQuestion: "این هفته چقدر برای آرامش ذهنی خودت وقت گذاشتی؟",
  scaleOptions: [
    { value: 1, label: "هرگز" },
    { value: 2, label: "خیلی کم" },
    { value: 3, label: "کم" },
    { value: 4, label: "متوسط" },
    { value: 5, label: "زیاد" },
    { value: 6, label: "خیلی زیاد" },
    { value: 7, label: "همیشه" },
  ],
  maxScaleSelections: 3,
  dailyPromptLabel: "امروز چه کاری برای آرامش ذهنت انجام دادی؟",
  moodEmojis: ["😞", "😕", "😐", "🙂", "😄"],
};

export const NUTRITION_CONTENT: AdviceSectionContent = {
  id: "nutrition",
  title: "پیشنهادات تغذیه",
  description:
    "وعده‌های غذایی متعادل شامل پروتئین، غلات کامل و سبزیجات را در برنامه هفتگی‌ات بگنجان.",
  scaleQuestion: "این هفته چقدر به برنامه تغذیه سالم پایبند بودی؟",
  scaleOptions: [
    { value: 1, label: "هرگز" },
    { value: 2, label: "خیلی کم" },
    { value: 3, label: "کم" },
    { value: 4, label: "متوسط" },
    { value: 5, label: "زیاد" },
    { value: 6, label: "خیلی زیاد" },
    { value: 7, label: "همیشه" },
  ],
  maxScaleSelections: 3,
  dailyPromptLabel: "امروز چه وعده سالمی خوردی؟",
  moodEmojis: ["😞", "😕", "😐", "🙂", "😄"],
};

export const WEIGHT_LOSS_CONTENT: AdviceSectionContent = {
  id: "weight-loss",
  title: "پیشنهادات کاهش وزن",
  description:
    "نوشیدن آب کافی، مصرف میوه و فعالیت روزانه سبک را فراموش نکن.",
  scaleQuestion: "این هفته چقدر به برنامه کاهش وزن پایبند بودی؟",
  scaleOptions: [
    { value: 1, label: "هرگز" },
    { value: 2, label: "خیلی کم" },
    { value: 3, label: "کم" },
    { value: 4, label: "متوسط" },
    { value: 5, label: "زیاد" },
    { value: 6, label: "خیلی زیاد" },
    { value: 7, label: "همیشه" },
  ],
  maxScaleSelections: 3,
  dailyPromptLabel: "امروز چه فعالیتی برای کاهش وزن انجام دادی؟",
  moodEmojis: ["😞", "😕", "😐", "🙂", "😄"],
};
