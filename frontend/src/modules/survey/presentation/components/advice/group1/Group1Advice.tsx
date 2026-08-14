// // src/modules/survey/presentation/components/advice/group1/Group1Advice.tsx
// import { useRef } from "react";
// import { NutritionSection } from "./NutritionSection";
// import { WeightLossSection } from "./WeightLossSection";
// import { MindPeaceSection } from "./MindPeaceSection";
// import { HealthAdviceBanner } from "../shared/HealthAdviceBanner";
// import { WeeklyGoalsHeader } from "../shared/WeeklyGoalsHeader";
// import { usePdfDownload } from "../../../hooks/usePdfDownload";
// import type { RiskAssessment } from "@survey/domain/entities/risk-assessment.entity";
// import logo from "@/assets/day-daydar-lockup.png";
// import type { SurveyAnswers } from "@survey/domain/entities/survey-answers.entity";
// import { RiskAnalysisSection } from "../../result/RiskAnalysisSection";

// interface Group1AdviceProps {
//   assessment: RiskAssessment;
//   answers: SurveyAnswers;   // ← اضافه شد
//   onShare: () => void;
// }

// export function Group1Advice({ assessment, onShare }: Group1AdviceProps) {
//   const contentRef = useRef<HTMLDivElement>(null);
//   const download = usePdfDownload(contentRef, logo);

//   return (
//     <div className="flex flex-col gap-6">
//       <div ref={contentRef} className="rounded-2xl bg-white">
//         <HealthAdviceBanner />
//         <WeeklyGoalsHeader
//           title="راهکارهای طلایی هفتگی برای رسیدن به تعادل"
//           bgColorClass="bg-day-red/20"
//           textColorClass="text-day-red"
//         />
//         <RiskAnalysisSection assessment={assessment} />
//         <NutritionSection />
//         <WeightLossSection />
//         <MindPeaceSection />
//       </div>

//       <div className="flex gap-3">
//         <button
//           onClick={onShare}
//           className="focus-visible:!outline-none cursor-pointer flex-1 rounded-xl border-2 bg-white px-6 py-3 text-sm font-semibold text-cyan-700 hover:bg-day-primary hover:text-white"
//         >
//           اشتراک‌گذاری
//         </button>
//         <button
//           onClick={() => download()}
//           className="focus-visible:!outline-none cursor-pointer flex-1 rounded-xl bg-day-primary px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
//         >
//           دانلود
//         </button>
//       </div>
//     </div>
//   );
// }

// src/modules/survey/presentation/components/advice/group1/Group1Advice.tsx
// Group1Advice.tsx
import type { RiskAssessment } from "@survey/domain/entities/risk-assessment.entity";
import type { SurveyAnswers } from "@survey/domain/entities/survey-answers.entity";
import type { BodyMetrics } from "@survey/domain/value-objects/body-metrics.vo";
import { AdviceLayout } from "../shared/AdviceLayout";

interface Props {
  assessment: RiskAssessment;
  answers: SurveyAnswers;
  bodyMetrics: BodyMetrics | null;
  onShare: () => void;
}

export function Group1Advice({ assessment, answers, bodyMetrics, onShare }: Props) {
  return (
    <AdviceLayout
      assessment={assessment}
      answers={answers}
      bodyMetrics={bodyMetrics}
      onShare={onShare}
    />
  );
}
