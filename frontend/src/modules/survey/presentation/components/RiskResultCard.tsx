// src/modules/survey/presentation/components/RiskResultCard.tsx
import { Button } from "@ds/components/Button";
import { Card } from "@ds/components/Card";
import { cn } from "@ds/lib/cn";
import {
  adviceFor,
  summaryFor,
  type RiskAssessment,
} from "@survey/domain/entities/risk-assessment.entity";

import type { BodyMetrics } from "@survey/domain/value-objects/body-metrics.vo";

import {
  persianDecimal,
  persianInteger,
} from "@survey/presentation/format/persian";
import { Group1Advice } from "@survey/presentation/components/advice/group1/Group1Advice";

import { Group4Advice } from "@survey/presentation/components/advice/group4/Group4Advice";


export interface RiskResultCardProps {
  assessment: RiskAssessment;
  bodyMetrics: BodyMetrics | null;
  onRestart: () => void;
}

const TIER_STEPS = ["low", "moderate", "elevated", "critical"] as const;

const TIER_LABELS: Record<string, string> = {
  low: "کم",
  moderate: "متوسط",
  elevated: "بالا",
  critical: "بحرانی",
};

const TIER_COLORS: Record<string, string> = {
  low: "bg-risk-low",
  moderate: "bg-risk-moderate",
  elevated: "bg-risk-elevated",
  critical: "bg-risk-critical",
};

export function RiskResultCard({
  assessment,
  bodyMetrics,
  onRestart,
}: RiskResultCardProps) {
  const tierIndex = TIER_STEPS.indexOf(
    assessment.tier as (typeof TIER_STEPS)[number],
  );

  const hasCustomAdvice =
    assessment.tier === "critical" || assessment.tier === "low";

  const handlePrint = () => window.print();

  const handleShare = async () => {
    const text = `نتیجه ارزیابی سلامت ${assessment.fullName}: ${assessment.levelLabel}`;
    if (navigator.share) {
      await navigator.share({ title: "نتیجه ارزیابی", text });
    } else {
      await navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-10">

      {/* توصیه */}
      {assessment.tier === "critical" ? (
        <Group1Advice assessment={assessment} onPrint={handlePrint} onShare={handleShare} />
      ) : assessment.tier === "low" ? (
        <Group4Advice assessment={assessment} onPrint={handlePrint} onShare={handleShare} />
      ) : (
        <Card>
          <h3 className="mb-2 text-sm font-semibold text-ink">توصیه</h3>
          <p className="text-sm leading-relaxed text-ink-subtle">
            {adviceFor(assessment)}
          </p>
        </Card>
      )}

      {/* disclaimer */}
      <p className="text-center text-xs leading-6 text-ink-subtle">
        این نتیجه جنبه اطلاع‌رسانی دارد و جایگزین مشاوره پزشکی نمی‌شود.
      </p>

      {/* نام و شروع مجدد */}
      <div className="flex flex-col items-center gap-3">
        <p className="text-sm text-ink-subtle">{assessment.fullName}</p>
        <Button variant="ghost" onClick={onRestart}>
          شروع مجدد
        </Button>
      </div>

      {!hasCustomAdvice && (
        <div className="flex gap-3">
          <button
            onClick={handleShare}
            className="cursor-pointer flex-1 rounded-xl border-2 border-cyan-400 bg-white px-6 py-3 text-sm font-semibold text-cyan-700 hover:bg-day-primary"
          >
            اشتراک‌گذاری
          </button>
          <button
            onClick={handlePrint}
            className="cursor-pointer flex-1 rounded-xl bg-day-primary px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            پرینت
          </button>
        </div>
      )}
    </div>
  );
}

