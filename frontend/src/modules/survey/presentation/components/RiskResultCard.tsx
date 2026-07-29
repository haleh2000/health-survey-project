import { Button } from "@ds/components/Button";
import { Card } from "@ds/components/Card";
import { cn } from "@ds/lib/cn";

import {
  RISK_TIER_ORDER,
  RiskTier,
  adviceFor,
  summaryFor,
  type RiskAssessment,
} from "@survey/domain/entities/risk-assessment.entity";
import type { BodyMetrics } from "@survey/domain/value-objects/body-metrics.vo";
import { persianDecimal, persianInteger } from "@survey/presentation/format/persian";

export interface RiskResultCardProps {
  assessment: RiskAssessment;
  /** Derived locally; the backend scores BMI but does not return it. */
  bodyMetrics: BodyMetrics | null;
  onRestart: () => void;
}

const TIER_STYLES: Record<RiskTier, { dot: string; badge: string; bar: string }> = {
  low: {
    dot: "bg-risk-low",
    badge: "bg-risk-low/10 text-risk-low",
    bar: "bg-risk-low",
  },
  moderate: {
    dot: "bg-risk-moderate",
    badge: "bg-risk-moderate/10 text-risk-moderate",
    bar: "bg-risk-moderate",
  },
  elevated: {
    dot: "bg-risk-elevated",
    badge: "bg-risk-elevated/10 text-risk-elevated",
    bar: "bg-risk-elevated",
  },
  critical: {
    dot: "bg-risk-critical",
    badge: "bg-risk-critical/10 text-risk-critical",
    bar: "bg-risk-critical",
  },
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-control bg-surface-muted px-4 py-3">
    <p className="text-xs text-ink-subtle">{label}</p>
    <p className="num-fa mt-1 text-lg font-semibold text-ink">{value}</p>
  </div>
);

export function RiskResultCard({
  assessment,
  bodyMetrics,
  onRestart,
}: RiskResultCardProps) {
  const style = TIER_STYLES[assessment.tier];
  const reachedIndex = RISK_TIER_ORDER.indexOf(assessment.tier);

  return (
    <div className="animate-step-in space-y-4">
      <Card padding="lg">
        <div className={cn("mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1", style.badge)}>
          <span className={cn("size-2 rounded-full", style.dot)} aria-hidden />
          <span className="text-xs font-medium">نتیجه ارزیابی</span>
        </div>

        <h2 className="text-xl leading-relaxed font-semibold text-ink">
          {assessment.levelLabel}
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-ink-subtle">
          {summaryFor(assessment)}
        </p>

        {/* Four segments, one per tier, filled up to the one reached. */}
        <div
          className="mt-5 flex gap-1.5"
          role="img"
          aria-label={`سطح ریسک: ${assessment.levelLabel}`}
        >
          {RISK_TIER_ORDER.map((tier, index) => (
            <span
              key={tier}
              className={cn(
                "h-2 flex-1 rounded-full transition-colors",
                index <= reachedIndex ? style.bar : "bg-line",
              )}
            />
          ))}
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <Stat label="نمره ریسک" value={persianDecimal(assessment.score)} />
          <Stat label="سن" value={`${persianInteger(assessment.ageYears)} سال`} />
          {bodyMetrics && (
            <>
              <Stat label="شاخص توده بدنی" value={persianDecimal(bodyMetrics.rounded)} />
              <Stat label="وضعیت وزن" value={bodyMetrics.categoryLabel} />
            </>
          )}
        </dl>
      </Card>

      <Card>
        <h3 className="mb-2 text-sm font-semibold text-ink">توصیه</h3>
        <p className="text-sm leading-relaxed text-ink-subtle">{adviceFor(assessment)}</p>
      </Card>

      <Card padding="sm" className="bg-surface-muted">
        <p className="text-xs leading-relaxed text-ink-subtle">
          این ارزیابی بر پایه پاسخ‌های خوداظهاری شماست و جایگزین معاینه، تشخیص یا
          درمان پزشکی نیست. برای هرگونه تصمیم درمانی با پزشک مشورت کنید.
        </p>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-ink-subtle">
          ثبت‌شده برای {assessment.fullName}
        </p>
        <Button variant="secondary" onClick={onRestart}>
          پر کردن پرسشنامه جدید
        </Button>
      </div>
    </div>
  );
}
