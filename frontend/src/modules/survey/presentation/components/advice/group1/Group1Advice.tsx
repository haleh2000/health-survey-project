// src/modules/survey/presentation/components/advice/Group1Advice.tsx
import { NutritionSection } from "./NutritionSection";
import { WeightLossSection } from "./WeightLossSection";
import { MindPeaceSection } from "./MindPeaceSection";
import { HealthAdviceBanner } from "../shared/HealthAdviceBanner";
import { WeeklyGoalsHeader } from "../shared/WeeklyGoalsHeader";
import { RiskResultHeader } from "../shared/RiskResultHeader";
import type { RiskAssessment } from "@survey/domain/entities/risk-assessment.entity";

interface Group1AdviceProps {
  assessment: RiskAssessment;
  onPrint: () => void;
  onShare: () => void;
}

export function Group1Advice({ assessment, onPrint, onShare }: Group1AdviceProps) {
  return (
    <div>
      <RiskResultHeader assessment={assessment} />
      return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl bg-white">
        <HealthAdviceBanner />
        <WeeklyGoalsHeader
        title="راهکارهای طلایی هفتگی برای رسیدن به تعادل"
        bgColorClass="bg-day-red/20"
        textColorClass="text-day-red"
      />
        <NutritionSection />
        <WeightLossSection />
        <MindPeaceSection />
      </div>

      <div className="flex gap-3">
        <button
          onClick={onShare}
          className="cursor-pointer flex-1 rounded-xl border-2 bg-white px-6 py-3 text-sm font-semibold text-cyan-700 hover:bg-day-primary hover:text-white"
        >
          اشتراک‌گذاری
        </button>
        <button
          onClick={onPrint}
          className="cursor-pointer flex-1 rounded-xl bg-day-primary px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
        >
          پرینت
        </button>
      </div>
    </div>
  );
    </div>
  );
}

