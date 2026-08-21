// src/modules/survey/presentation/components/dashboard/story-images.ts
// ─────────────────────────────────────────────────────────────────────────────
// 📸 جای تصویر استوری‌ها
//
// هر استوری یک تصویر کوچک دارد که داخل کارت استوری (نه به‌عنوان پس‌زمینه)
// نمایش داده می‌شود. کلیدِ هر ردیف، همان `id` اسلاید در `recommendationStories`
// است.
//
// برای جایگزینی با تصویر واقعی:
//   ۱) فایل تصویر را در `src/assets/stories/` بگذارید (مثلاً `c-n1.png`).
//   ۲) بالای همین فایل import کنید:  import cN1 from "@assets/stories/c-n1.png";
//   ۳) مقدار همان کلید را به `cN1` تغییر دهید.
//
// هر کلیدی که مقدار نداشته باشد، به‌صورت خودکار از تصویر پیش‌فرضِ دستهٔ خودش
// (تغذیه / ورزش / آرامش ذهن) استفاده می‌کند — پس لازم نیست همه را یک‌جا پر کنید.
// ─────────────────────────────────────────────────────────────────────────────

import exerciseImg from "@assets/exercise.png";
import nutritionImg from "@assets/nutrition.png";
import peaceImg from "@assets/peace.png";

import type { StoryGroupKey } from "./recommendationStories";

/** تصویر پیش‌فرض هر دسته — تا وقتی تصویر اختصاصیِ اسلاید جایگزین نشده. */
export const CATEGORY_FALLBACK_IMAGE: Record<StoryGroupKey, string> = {
  nutrition: nutritionImg,
  exercise: exerciseImg,
  peace: peaceImg,
};

/**
 * تصویر اختصاصی هر اسلاید. فعلاً همگی تصویرِ نمونهٔ دستهٔ خودشان هستند؛
 * هر ردیف را که خواستید با تصویر واقعی جایگزین کنید.
 */
export const STORY_IMAGES: Readonly<Record<string, string>> = {
  // ── گروه پرریسک · تغذیه ───────────────────────────────────────────────
  "c-n1": nutritionImg,
  "c-n2": nutritionImg,
  "c-n3": nutritionImg,
  "c-n4": nutritionImg,
  // ── گروه پرریسک · کاهش وزن ────────────────────────────────────────────
  "c-w1": exerciseImg,
  "c-w2": exerciseImg,
  "c-w3": exerciseImg,
  "c-w4": exerciseImg,
  "c-w5": exerciseImg,
  // ── گروه پرریسک · آرامش ذهن ───────────────────────────────────────────
  "c-p1": peaceImg,
  "c-p2": peaceImg,
  "c-p3": peaceImg,

  // ── آستانهٔ خطر (کوتاه‌مدت) ────────────────────────────────────────────
  "e-n1": nutritionImg,
  "e-n2": nutritionImg,
  "e-n3": nutritionImg,
  "e-n4": nutritionImg,
  "e-e1": exerciseImg,
  "e-e2": exerciseImg,
  "e-p1": peaceImg,
  "e-p2": peaceImg,
  "e-p3": peaceImg,
  "e-p4": peaceImg,
  "e-p5": peaceImg,

  // ── آستانهٔ خطر (بلندمدت) ──────────────────────────────────────────────
  "m-n1": nutritionImg,
  "m-n2": nutritionImg,
  "m-n3": nutritionImg,
  "m-n4": nutritionImg,
  "m-e1": exerciseImg,
  "m-e2": exerciseImg,
  "m-e3": exerciseImg,
  "m-e4": exerciseImg,
  "m-e5": exerciseImg,
  "m-p1": peaceImg,
  "m-p2": peaceImg,
  "m-p3": peaceImg,

  // ── افراد سالم ────────────────────────────────────────────────────────
  "l-n1": nutritionImg,
  "l-n2": nutritionImg,
  "l-e1": exerciseImg,
  "l-e2": exerciseImg,
  "l-p1": peaceImg,
  "l-p2": peaceImg,
};
