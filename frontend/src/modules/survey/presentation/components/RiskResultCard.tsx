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
import { Group1Advice } from "@survey/presentation/components/advice/Group1Advice";

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
      {/* هدر نتیجه */}
      <Card className="text-center">
        <div
          className={cn(
            "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-white text-2xl font-bold",
            TIER_COLORS[assessment.tier] ?? "bg-gray-400",
          )}
        >
          {persianInteger(assessment.score)}
        </div>
        <h2 className="text-lg font-bold text-ink">{assessment.levelLabel}</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-subtle">
          {summaryFor(assessment)}
        </p>
      </Card>

      {/* نوار چهارمرحله‌ای */}
      <div className="flex gap-1">
        {TIER_STEPS.map((step, i) => (
          <div key={step} className="flex flex-1 flex-col items-center gap-1">
            <div
              className={cn(
                "h-2 w-full rounded-full transition-colors",
                i <= tierIndex
                  ? (TIER_COLORS[step] ?? "bg-gray-300")
                  : "bg-surface-muted",
              )}
            />
            <span className="text-xs text-ink-subtle">{TIER_LABELS[step]}</span>
          </div>
        ))}
      </div>

      {/* آمار */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <p className="text-xs text-ink-subtle">نمره</p>
          <p className="text-xl font-bold text-ink">
            {persianInteger(assessment.score)}
          </p>
        </Card>
        <Card className="text-center">
          <p className="text-xs text-ink-subtle">سن</p>
          <p className="text-xl font-bold text-ink">
            {persianInteger(assessment.ageYears)}
          </p>
        </Card>
        {bodyMetrics ? (
          <Card className="text-center">
            <p className="text-xs text-ink-subtle">BMI</p>
            <p className="text-xl font-bold text-ink">
              {persianDecimal(bodyMetrics.rounded)}
            </p>
            <p className="text-xs text-ink-subtle">{bodyMetrics.categoryLabel}</p>
          </Card>
        ) : (
          <Card className="text-center">
            <p className="text-xs text-ink-subtle">BMI</p>
            <p className="text-xl font-bold text-ink-subtle">—</p>
          </Card>
        )}
      </div>

      {/* توصیه */}
      {assessment.tier === "critical" ? (
        <Group1Advice onPrint={handlePrint} onShare={handleShare} />
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

      {/* دکمه‌های پرینت/اشتراک — فقط برای tierهای غیر critical */}
      {assessment.tier !== "critical" && (
        <div className="flex gap-3">
          <button
            onClick={handleShare}
            className="flex-1 rounded-xl border-2 border-cyan-400 bg-white px-6 py-3 text-sm font-semibold text-cyan-700 hover:bg-cyan-50"
          >
            اشتراک‌گذاری
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            پرینت
          </button>
        </div>
      )}
    </div>
  );
}
