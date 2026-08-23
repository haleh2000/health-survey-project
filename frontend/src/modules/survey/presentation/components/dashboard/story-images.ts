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

import bmiImg from "@assets/stories/Elevated/exercise/bmi-گروه در آستانه خطر در بلند مدت.png";
import runImg from "@assets/stories/Elevated/exercise/پیاده روی-گروه در آستانه خطر در بلند مدت.png";
import teaImg from "@assets/stories/Elevated/exercise/چای سبز-گروه در آستانه خطر در بلند مدت.png";
import roadmapImg from "@assets/stories/Elevated/exercise/نقشه راه-گروه در آستانه خطر بلندمدت.png";
import metabolicImg from "@assets/stories/Elevated/exercise/شتاب متابولیک-گروه در آستانه خطر بلندمدت .png";
import bodymg from "@assets/stories/Elevated/exercise/آشنایی با بدن-گروه در آستانه خطر بلندمدت.png";
import optimizeImg from "@assets/stories/Elevated/exercise/بهینه سازی-گروه در آستانه خطر بلندمدت.png";

import plannerImg from "@assets/stories/Elevated/peace/پلنر-گروه در آستانه خطر بلندمدت.png";
import debugImg from "@assets/stories/Elevated/peace/عیب یابی-گروه در آستانه خطر بلندمدت.png";
import meditationImg from "@assets/stories/Elevated/peace/مراقبت ذهن-گروه در آستانه خطر بلندمدت.png";

import WatImg from "@assets/stories/Moderate/nutrition/آب-گروه در آستانه خطر کوتاه مدت.png";
import rainbowImg from "@assets/stories/Moderate/nutrition/بشقاب رنگین_کمانی-گروه در آستانه خطر کوتاه مدت.png";
import deleteImg from "@assets/stories/Moderate/nutrition/حذف ناسالم-گروه در آستانه خطر کوتاه مدت.png";
import powerImg from "@assets/stories/Moderate/nutrition/قدرت پروتئین-گروه در آستانه خطر کوتاه مدت.png";

import restImg from "@assets/stories/Moderate/exercise/استراحت-گروه در آستانه خطر کوتاه مدت.png";
import walkImg from "@assets/stories/Moderate/exercise/پیاده روی-گروه در آستانه خطر کوتاه مدت.png";

import RouteImg from "@assets/stories/Moderate/peace/هدف smart - بازشگت به مسیر .png";
import reasonImg from "@assets/stories/Moderate/peace/هدف smart - پیداکردن دلیل.png";
import trapImg from "@assets/stories/Moderate/peace/هدف smart - شناسایی تله.png";
import stepImg from "@assets/stories/Moderate/peace/هدف smart - قدم کوچک.png";
import targetImg from "@assets/stories/Moderate/peace/هدف smart - گروه در آستانه خطر کوتاه مدت.png";

import balanceImg from "@assets/stories/Low/nutrition/تعادل-گروه سالم.png";
import qualityImg from "@assets/stories/Low/nutrition/کیفیت-گروه سالم.png";

import practiceImg from "@assets/stories/Low/exercise/تمرینات ورزشی-گروه سالم.png";
import diversityImg from "@assets/stories/Low/exercise/تنوع در حرکت-گروه سالم.png";

import thanksgivingImg from "@assets/stories/Low/peace/شکرگزاری -گروه سالم.png";
import digitalImg from "@assets/stories/Low/peace/مرزهای دیجیتال-گروه سالم.png";


import type { StoryGroupKey } from "./recommendationStories";

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
  "e-n1": rainbowImg,
  "e-n2": powerImg,
  "e-n3": WatImg,
  "e-n4": deleteImg,
  "e-e1": walkImg,
  "e-e2": restImg,
  "e-p1": targetImg,
  "e-p2": stepImg,
  "e-p3": reasonImg,
  "e-p4": RouteImg,
  "e-p5": trapImg,

  // ── آستانهٔ خطر (بلندمدت) ──────────────────────────────────────────────
  "m-n1": homeTableImg,
  "m-n2": mediterraneanPlatetImg,
  "m-e1": bmiImg,
  "m-e2": runImg,
  "m-e3": teaImg,
  "m-e4": roadmapImg,
  "m-e5": bodymg,
  "m-e6": metabolicImg,
  "m-e7": optimizeImg,
  "m-p1": plannerImg,
  "m-p2": debugImg,
  "m-p3": meditationImg,

  // ── افراد سالم ────────────────────────────────────────────────────────
  "l-n1": qualityImg,
  "l-n2": balanceImg,
  "l-e1": practiceImg,
  "l-e2": diversityImg,
  "l-p1": thanksgivingImg,
  "l-p2": digitalImg,
};
