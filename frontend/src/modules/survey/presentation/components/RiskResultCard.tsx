// src/modules/survey/presentation/components/RiskResultCard.tsx

import { Button } from "@ds/components/Button";
import type { RiskAssessment } from "@survey/domain/entities/risk-assessment.entity";
import type { SurveyAnswers } from "@survey/domain/entities/survey-answers.entity";
import type { BodyMetrics } from "@survey/domain/value-objects/body-metrics.vo";
import { AdviceLayout } from "@survey/presentation/components/advice/shared/AdviceLayout";

export interface RiskResultCardProps {
  assessment: RiskAssessment;
  answers: SurveyAnswers;
  bodyMetrics: BodyMetrics | null;
  onRestart: () => void;
}

export function RiskResultCard({ assessment, answers, bodyMetrics, onRestart }: RiskResultCardProps) {
  const handleShare = async () => {
    const text = `نتیجه ارزیابی سلامت ${assessment.fullName}: ${assessment.levelLabel}`;
    if (navigator.share) await navigator.share({ title: "نتیجه ارزیابی", text });
    else await navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <AdviceLayout
        assessment={assessment}
        answers={answers}
        bodyMetrics={bodyMetrics}
        nationalId={assessment.nationalId}
        onShare={handleShare}
      />

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
