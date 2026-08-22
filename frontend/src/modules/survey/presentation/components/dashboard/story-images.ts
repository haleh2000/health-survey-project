// src/modules/survey/presentation/components/dashboard/story-images.ts
import exerciseImg from "@assets/exercise.png";
import nutritionImg from "@assets/nutrition.png";
import peaceImg from "@assets/peace.png";


import waterImg from "@assets/stories/Critical/nutrition/آب گروه پر ریسک.png";
import proImg from "@assets/stories/Critical/nutrition/پروتئین گروه پر ریسک.png";
import riceImg from "@assets/stories/Critical/nutrition/برنج گروه پر ریسک.png";
import plateImg from "@assets/stories/Critical/nutrition/بشقاب ضدالتهابی گروه پر ریسک.png";

import susImg from "@assets/stories/Critical/exercise/حذف سس-گروه پر ریسک.png";
import sweetImg from "@assets/stories/Critical/exercise/حذف شیرینی-گروه پر ریسک.png";
import sugarImg from "@assets/stories/Critical/exercise/حذف_قند-گروه_پر_ریسک.png";
import dairyImg from "@assets/stories/Critical/exercise/لبنیات سبک‌تر-گروه پر ریسک.png";
import bakingImg from "@assets/stories/Critical/exercise/روش پخت-گروه پر ریسک.png";

import peaceMindImg from "@assets/stories/Critical/peace/آرامش فکر-گروه پرریسک.png";
import happyEnd from "@assets/stories/Critical/peace/پایان خوش-گروه پرریسک.png";
import temperamentImg from "@assets/stories/Critical/peace/ردیابی خلق و خو-گروه پرریسک.png";

import mediterraneanPlatetImg from "@assets/stories/Elevated/nutrition/بشقاب مدیترانه ای-گروه در آستانه خطر در بلند مدت.png";
import homeTableImg from "@assets/stories/Elevated/nutrition/سفره خانگی-گروه در آستانه خطر در بلند مدت.png";



import type { StoryGroupKey } from "./recommendationStories";

/** تصویر پیش‌فرض هر دسته — تا وقتی تصویر اختصاصیِ اسلاید جایگزین نشده. */
export const CATEGORY_FALLBACK_IMAGE: Record<StoryGroupKey, string> = {
  nutrition: nutritionImg,
  exercise: exerciseImg,
  peace: peaceImg,
};

export const STORY_IMAGES: Readonly<Record<string, string>> = {
  // ── گروه پرریسک · تغذیه ───────────────────────────────────────────────
  "c-n1": plateImg,
  "c-n2": proImg,
  "c-n3": waterImg,
  "c-n4": riceImg,
  // ── گروه پرریسک · کاهش وزن ────────────────────────────────────────────
  "c-w1": sugarImg,
  "c-w2": bakingImg,
  "c-w3": sweetImg,
  "c-w4": susImg,
  "c-w5": dairyImg,
  // ── گروه پرریسک · آرامش ذهن ───────────────────────────────────────────
  "c-p1": peaceMindImg,
  "c-p2": happyEnd,
  "c-p3": temperamentImg,

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
  "m-n1": homeTableImg,
  "m-n2": mediterraneanPlatetImg,
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
