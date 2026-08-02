// src/modules/survey/presentation/components/advice/shared/RiskResultHeader.tsx
import { cn } from "@ds/lib/cn";
import type { RiskAssessment } from "@survey/domain/entities/risk-assessment.entity";

const TIER_STEPS = ["low", "moderate", "elevated", "critical"] as const;
type Tier = (typeof TIER_STEPS)[number];

const TIER_LABELS: Record<Tier, string> = {
  low: "کم", moderate: "متوسط", elevated: "بالا", critical: "بحرانی",
};

const TIER_COLORS: Record<Tier, { bg: string; text: string; bar: string }> = {
  low:      { bg: "bg-green-100",  text: "text-green-700",  bar: "bg-green-500" },
  moderate: { bg: "bg-yellow-100", text: "text-yellow-700", bar: "bg-yellow-400" },
  elevated: { bg: "bg-orange-100", text: "text-orange-700", bar: "bg-orange-500" },
  critical: { bg: "bg-red-100",    text: "text-red-700",    bar: "bg-red-500" },
};

function isTier(value: string): value is Tier {
  return TIER_STEPS.includes(value as Tier);
}

export function RiskResultHeader({ assessment }: { assessment: RiskAssessment }) {
  const tier = isTier(assessment.tier) ? assessment.tier : "moderate";
  const colors = TIER_COLORS[tier];
  const tierIndex = TIER_STEPS.indexOf(tier);

  return (
    <div className={cn("flex flex-col gap-4 rounded-2xl p-4 shadow-sm", colors.bg)}>
      <div className="flex items-center gap-3">
        <div className={cn("flex h-14 w-14 items-center justify-center rounded-full text-white text-xl font-bold", colors.bar)}>
          {assessment.score}
        </div>
        <div className="flex flex-col">
          <span className={cn("text-lg font-bold", colors.text)}>{assessment.levelLabel}</span>
          <span className="text-sm text-gray-600">{assessment.fullName}</span>
        </div>
      </div>

      <div className="flex gap-1">
        {TIER_STEPS.map((t, i) => {
          const active = i <= tierIndex;
          const isCurrent = i === tierIndex;
          return (
            <div key={t} className="flex flex-1 flex-col items-center gap-1">
              <div className={cn(
                "h-3 w-full rounded-full",
                active ? TIER_COLORS[t].bar : "bg-gray-200",
                isCurrent && "ring-2 ring-offset-1 ring-current"
              )} />
              <span className={cn("text-xs font-medium", isCurrent ? colors.text : "text-gray-400")}>
                {TIER_LABELS[t]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
