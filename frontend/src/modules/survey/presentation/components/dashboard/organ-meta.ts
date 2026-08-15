// src/modules/survey/presentation/components/dashboard/organ-meta.ts

import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Brain,
  Droplets,
  Flame,
  HeartPulse,
  Leaf,
  Utensils,
  Wind,
} from "lucide-react";

import type { OrganRisks } from "@survey/domain/entities/risk-assessment.entity";

/**
 * Presentation metadata for the eight organ risk indices.
 *
 * `maxScore` mirrors the theoretical maximum each index can reach in
 * backend/processing.py, so percentages shown to the user are honest
 * proportions of the scoring model rather than arbitrary scaling.
 */
export interface OrganMeta {
  readonly key: keyof OrganRisks;
  readonly label: string;
  readonly icon: LucideIcon;
  readonly maxScore: number;
  /** Main driver shown under the bar, mirroring the reference design. */
  readonly driverLabel: string;
}

export const ORGAN_META: readonly OrganMeta[] = [
  { key: "lung",      label: "ریسک ریه",        icon: Wind,       maxScore: 9,  driverLabel: "دخانیات و آلودگی هوا" },
  { key: "gastric",   label: "ریسک معده",       icon: Flame,      maxScore: 10, driverLabel: "نمک، نوشیدنی داغ و عفونت" },
  { key: "colon",     label: "ریسک روده بزرگ",  icon: Utensils,   maxScore: 9,  driverLabel: "تغذیه و تحرک" },
  { key: "pancreas",  label: "ریسک پانکراس",    icon: Droplets,   maxScore: 10, driverLabel: "دخانیات و وزن" },
  { key: "stroke",    label: "ریسک سکته مغزی",  icon: Brain,      maxScore: 7,  driverLabel: "فشار خون و سابقه" },
  { key: "cardiac",   label: "ریسک قلبی",       icon: HeartPulse, maxScore: 7,  driverLabel: "قلب، فشار خون و وزن" },
  { key: "metabolic", label: "ریسک متابولیک",   icon: Activity,   maxScore: 5,  driverLabel: "دیابت و فشار خون" },
  { key: "liver",     label: "ریسک کبد",        icon: Leaf,       maxScore: 10, driverLabel: "الکل، وزن و عفونت" },
];

export const organPercent = (risks: OrganRisks, meta: OrganMeta): number =>
  Math.round(Math.min(risks[meta.key] / meta.maxScore, 1) * 100);

export interface SeverityStyle {
  readonly label: string;
  readonly textClass: string;
  readonly chipClass: string;
  /** Solid hex for SVG/inline gradients where Tailwind classes can't reach. */
  readonly hex: string;
}

export const severityOf = (percent: number): SeverityStyle => {
  if (percent >= 67)
    return { label: "بالا", textClass: "text-risk-critical", chipClass: "bg-red-500/10 text-risk-critical", hex: "#dc2626" };
  if (percent >= 34)
    return { label: "قابل توجه", textClass: "text-risk-elevated", chipClass: "bg-orange-500/10 text-risk-elevated", hex: "#ea580c" };
  if (percent >= 12)
    return { label: "متوسط", textClass: "text-risk-moderate", chipClass: "bg-amber-500/10 text-risk-moderate", hex: "#ca8a04" };
  return { label: "کم", textClass: "text-risk-low", chipClass: "bg-teal-500/10 text-risk-low", hex: "#0d9488" };
};
