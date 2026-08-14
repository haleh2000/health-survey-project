// src/modules/survey/presentation/components/advice/shared/TierConfig.ts

import { RiskTier } from "@survey/domain/entities/risk-assessment.entity";

export type RecommendationCategory = "nutrition" | "exercise" | "psychology" | "medical";

export interface TierConfig {
  tier: RiskTier;
  groupLabel: string;
  accentClass: string;
  accentTextClass: string;
  accentBgClass: string;
  progressBarClass: string;
  hoverBgClass: string;
  recommendationCategories: RecommendationCategory[];
}

export const TIER_CONFIGS: Record<RiskTier, TierConfig> = {
  [RiskTier.Critical]: {
    tier: RiskTier.Critical,
    groupLabel: "گروه ۱ — ریسک بحرانی",
    accentClass: "border-red-400",
    accentTextClass: "text-red-600",
    accentBgClass: "bg-red-50",
    progressBarClass: "bg-red-400",
    hoverBgClass: "hover:bg-red-50",
    recommendationCategories: ["medical", "nutrition", "exercise", "psychology"],
  },
  [RiskTier.Elevated]: {
    tier: RiskTier.Elevated,
    groupLabel: "گروه ۲ — ریسک بالا",
    accentClass: "border-orange-400",
    accentTextClass: "text-orange-600",
    accentBgClass: "bg-orange-50",
    progressBarClass: "bg-orange-400",
    hoverBgClass: "hover:bg-orange-50",
    recommendationCategories: ["nutrition", "exercise", "psychology", "medical"],
  },
  [RiskTier.Moderate]: {
    tier: RiskTier.Moderate,
    groupLabel: "گروه ۳ — ریسک متوسط",
    accentClass: "border-amber-400",
    accentTextClass: "text-amber-600",
    accentBgClass: "bg-amber-50",
    progressBarClass: "bg-amber-400",
    hoverBgClass: "hover:bg-amber-50",
    recommendationCategories: ["nutrition", "exercise", "psychology"],
  },
  [RiskTier.Low]: {
    tier: RiskTier.Low,
    groupLabel: "گروه ۴ — ریسک پایین",
    accentClass: "border-emerald-400",
    accentTextClass: "text-emerald-600",
    accentBgClass: "bg-emerald-50",
    progressBarClass: "bg-emerald-400",
    hoverBgClass: "hover:bg-emerald-50",
    recommendationCategories: ["nutrition", "exercise", "psychology"],
  },
};
