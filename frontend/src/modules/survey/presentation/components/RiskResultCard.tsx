// src/modules/survey/presentation/components/RiskResultCard.tsx
import { Button } from "@ds/components/Button";
import { adviceFor, type RiskAssessment } from "@survey/domain/entities/risk-assessment.entity";
import type { BodyMetrics } from "@survey/domain/value-objects/body-metrics.vo";
import { Group1Advice } from "@survey/presentation/components/advice/group1/Group1Advice";
// import { Group2Advice } from "@survey/presentation/components/advice/group2/Group2Advice";
import { Group3Advice } from "@survey/presentation/components/advice/group2/Group2Advice";
import { Group4Advice } from "@survey/presentation/components/advice/group4/Group4Advice";

export interface RiskResultCardProps {
  assessment: RiskAssessment;
  bodyMetrics: BodyMetrics | null;
  onRestart: () => void;
}

export function RiskResultCard({ assessment, onRestart }: RiskResultCardProps) {
  const handlePrint = () => window.print();
  const handleShare = async () => {
    const text = `نتیجه ارزیابی سلامت ${assessment.fullName}: ${assessment.levelLabel}`;
    if (navigator.share) await navigator.share({ title: "نتیجه ارزیابی", text });
    else await navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      {assessment.tier === "critical" ? (
        <Group1Advice assessment={assessment} onPrint={handlePrint} onShare={handleShare} />
      ) : assessment.tier === "elevated" ? (
        <Group3Advice assessment={assessment} onPrint={handlePrint} onShare={handleShare} />
      ) : assessment.tier === "moderate" ? (
        <Group3Advice assessment={assessment} onPrint={handlePrint} onShare={handleShare} />
      ) : (
        <Group4Advice assessment={assessment} onPrint={handlePrint} onShare={handleShare} />
      )}

      <p className="text-center text-xs leading-6 text-ink-subtle">
        این نتیجه جنبه اطلاع‌رسانی دارد و جایگزین مشاوره پزشکی نمی‌شود.
      </p>

      <div className="flex flex-col items-center gap-3">
        <p className="text-sm text-ink-subtle">{assessment.fullName}</p>
        <Button variant="ghost" onClick={onRestart}>شروع مجدد</Button>
      </div>
    </div>
  );
}
