// src/modules/survey/presentation/components/advice/shared/AdviceLayout.tsx

import { useRef, useState } from "react";
import type { RiskAssessment } from "@survey/domain/entities/risk-assessment.entity";
import type { SurveyAnswers } from "@survey/domain/entities/survey-answers.entity";
import type { BodyMetrics } from "@survey/domain/value-objects/body-metrics.vo";
import { TIER_CONFIGS } from "./TierConfig";
import { RiskHistorySummarySection } from "./RiskHistorySummarySection";
import { BmiVisualizerSection } from "./BmiVisualizerSection";
import { RecommendationsSection } from "./RecommendationsSection";
import { usePdfDownload } from "../../../hooks/usePdfDownload";
import logo from "@/assets/day-daydar-lockup.png";

// ── Import your actual history modal here ──────────────────────────────────
// import { AssessmentHistoryModal } from "@survey/presentation/components/AssessmentHistoryModal";

interface Props {
  assessment: RiskAssessment;
  answers: SurveyAnswers;
  bodyMetrics: BodyMetrics | null;
  onShare: () => void;
}

export function AdviceLayout({ assessment, answers, bodyMetrics, onShare }: Props) {
  const contentRef = useRef<HTMLDivElement>(null);
  const config = TIER_CONFIGS[assessment.tier];
  const download = usePdfDownload(contentRef, logo);

  const [historyOpen, setHistoryOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4" dir="rtl">
      <div ref={contentRef} className="flex flex-col gap-4">
        <RiskHistorySummarySection
          assessment={assessment}
          config={config}
          onHistoryOpen={() => setHistoryOpen(true)}
        />

        {bodyMetrics && (
          <BmiVisualizerSection bodyMetrics={bodyMetrics} config={config} />
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

      {/* ── Assessment History Modal ──────────────────────────────────────────
          Replace the placeholder below with your real modal component.
          The modal receives historyOpen and a close handler.          */}
      {historyOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="تاریخچه ارزیابی‌ها"
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="بستن"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setHistoryOpen(false)}
          />

          {/* Sheet / modal body — swap this div with <AssessmentHistoryModal /> */}
          <div className="relative z-10 w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800">
                تاریخچه ارزیابی‌ها
              </h2>
              <button
                type="button"
                onClick={() => setHistoryOpen(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
                aria-label="بستن"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor"
                        strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* ── Replace inner content with real history list ── */}
            <p className="text-sm text-slate-400 text-center py-8">
              داده‌های تاریخچه اینجا نمایش داده می‌شود.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
