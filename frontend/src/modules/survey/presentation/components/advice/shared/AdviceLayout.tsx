
// src/modules/survey/presentation/components/advice/shared/AdviceLayout.tsx

import { useCallback, useRef, useState } from "react";
import type { RiskAssessment } from "@survey/domain/entities/risk-assessment.entity";
import type { SurveyAnswers } from "@survey/domain/entities/survey-answers.entity";
import type { BodyMetrics } from "@survey/domain/value-objects/body-metrics.vo";
import { TIER_CONFIGS } from "./TierConfig";
import { RiskHistorySummarySection } from "./RiskHistorySummarySection";
import { BmiVisualizerSection } from "./BmiVisualizerSection";
import { RecommendationsSection } from "./RecommendationsSection";
import { usePdfDownload } from "../../../hooks/usePdfDownload";
import { useSurveyDependencies } from "@survey/presentation/state/survey-dependencies.context";
import { AssessmentHistoryModal } from "@survey/presentation/components/dashboard/AssessmentHistoryModal";
import type { AssessmentRecord } from "@survey/infrastructure/storage/assessment-history.storage";
import logo from "@/assets/day-daydar-lockup.png";

interface Props {
  assessment: RiskAssessment;
  answers: SurveyAnswers;
  bodyMetrics: BodyMetrics | null;
  nationalId: string;
  onShare: () => void;
}

export function AdviceLayout({
  assessment,
  answers,
  bodyMetrics,
  nationalId,
  onShare,
}: Props) {
  const contentRef = useRef<HTMLDivElement>(null);
  const config = TIER_CONFIGS[assessment.tier];
  const download = usePdfDownload(contentRef, logo);
  const { historyRepository } = useSurveyDependencies();

  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyRecords, setHistoryRecords] = useState<
    readonly AssessmentRecord[]
  >([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);

    try {
      const result = await historyRepository.fetchByNationalId(nationalId);

      if (result.ok) {
        setHistoryRecords(result.value);
      }
    } finally {
      setHistoryLoading(false);
    }
  }, [historyRepository, nationalId]);

  const handleHistoryOpen = useCallback(() => {
    setHistoryOpen(true);
    void fetchHistory();
  }, [fetchHistory]);

  return (
    <div className="flex flex-col gap-4" dir="rtl">
      <div ref={contentRef} className="flex flex-col gap-4">
        <RiskHistorySummarySection
          assessment={assessment}
          config={config}
          onHistoryOpen={handleHistoryOpen}
        />

        {bodyMetrics && (
          <BmiVisualizerSection
            bodyMetrics={bodyMetrics}
            config={config}
          />
        )}

        <RecommendationsSection
          assessment={assessment}
          answers={answers}
          config={config}
        />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onShare}
          className={`flex-1 rounded-xl border-2 px-6 py-3 text-sm font-semibold
            transition-colors focus-visible:outline-none focus-visible:ring-2
            ${config.accentClass} ${config.accentTextClass}`}
        >
          اشتراک‌گذاری
        </button>

        <button
          type="button"
          onClick={() => download()}
          className="flex-1 rounded-xl bg-day-primary px-6 py-3 text-sm font-semibold
            text-white transition-opacity hover:opacity-90
            focus-visible:outline-none focus-visible:ring-2"
        >
          دانلود PDF
        </button>
      </div>

      {historyLoading && historyOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="rounded-2xl bg-white p-6 text-sm text-slate-500 shadow-xl">
            در حال بارگذاری تاریخچه…
          </div>
        </div>
      )}

      <AssessmentHistoryModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={historyRecords}
      />
    </div>
  );
}

