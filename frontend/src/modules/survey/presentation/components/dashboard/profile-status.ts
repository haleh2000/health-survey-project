// src/modules/survey/presentation/components/dashboard/profile-status.ts
// حوزه‌های وضعیتِ پروفایل (دخانیات، تغذیه، …) و پرچم‌هایی که هر حوزه را
// «نیازمند پیگیری» می‌کنند. اینجا جدا نگه داشته شده تا هم پنل داشبورد و هم
// سند PDF از یک منبعِ واحد بخوانند.

import { Cigarette, Dumbbell, Salad, Scale, Soup, Stethoscope } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { AssessmentFlags } from "@survey/domain/entities/risk-assessment.entity";

export interface StatusItem {
  readonly title: string;
  readonly icon: LucideIcon;
  /** پرچم‌های مربوط به این حوزه — تعدادِ فعال = شدت */
  readonly flagsOf: (flags: AssessmentFlags) => readonly boolean[];
  readonly goodLabel: string;
  readonly badLabel: string;
}

export const STATUS_ITEMS: readonly StatusItem[] = [
  {
    title: "دخانیات",
    icon: Cigarette,
    flagsOf: (f) => [f.heavy_smoker, f.hookah_ecig],
    goodLabel: "بدون مصرف پرخطر",
    badLabel: "مصرف پرخطر",
  },
  {
    title: "الگوی تغذیه",
    icon: Salad,
    flagsOf: (f) => [f.junk_food, f.low_fiber, f.processed_meat_high],
    goodLabel: "الگوی سالم",
    badLabel: "نیاز به اصلاح",
  },
  {
    title: "نمک و غذای دودی",
    icon: Soup,
    flagsOf: (f) => [f.salty_food, f.smoked_food, f.hot_drink],
    goodLabel: "در محدوده ایمن",
    badLabel: "مراقب مصرف باشید",
  },
  {
    title: "فعالیت بدنی",
    icon: Dumbbell,
    flagsOf: (f) => [f.low_physical_activity],
    goodLabel: "تحرک کافی",
    badLabel: "تحرک کم",
  },
  {
    title: "وزن و تناسب",
    icon: Scale,
    flagsOf: (f) => [f.obesity],
    goodLabel: "محدوده سالم",
    badLabel: "خارج از محدوده",
  },
  {
    title: "سوابق بالینی",
    icon: Stethoscope,
    flagsOf: (f) => [
      f.diabetes,
      f.hypertension,
      f.heart_disease,
      f.chronic_pancreatitis,
      f.infectious_disease,
      f.brain_stroke_history,
      f.heart_attack_history,
    ],
    goodLabel: "بدون سابقه",
    badLabel: "نیازمند پیگیری",
  },
];

/** حوزه‌ها به ترتیب شدت (تعداد پرچم فعال) از زیاد به کم. */
export const rankStatuses = (
  flags: AssessmentFlags | null,
): readonly { readonly item: StatusItem; readonly fired: number }[] =>
  STATUS_ITEMS.map((item) => ({
    item,
    fired: flags ? item.flagsOf(flags).filter(Boolean).length : 0,
  })).sort((a, b) => b.fired - a.fired);
