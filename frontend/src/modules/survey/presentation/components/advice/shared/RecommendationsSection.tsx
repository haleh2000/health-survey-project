// src/modules/survey/presentation/components/advice/shared/RecommendationsSection.tsx

import type { RiskAssessment } from "@survey/domain/entities/risk-assessment.entity";
import type { SurveyAnswers } from "@survey/domain/entities/survey-answers.entity";
import type { TierConfig, RecommendationCategory } from "./TierConfig";

const CATEGORY_META: Record<
  RecommendationCategory,
  { label: string; subtitle: string; emoji: string; bg: string; hoverBg: string }
> = {
  nutrition: {
    label: "تغذیه",
    subtitle: "هوشمندانه بخور، بهتر زندگی کن",
    emoji: "🥗",
    bg: "bg-emerald-50",
    hoverBg: "hover:bg-emerald-100",
  },
  exercise: {
    label: "ورزش",
    subtitle: "بیشتر حرکت کن، قوی‌تر باش",
    emoji: "🏃",
    bg: "bg-sky-50",
    hoverBg: "hover:bg-sky-100",
  },
  psychology: {
    label: "روانشناسی",
    subtitle: "ذهن آرام، زندگی شاد",
    emoji: "🧘",
    bg: "bg-violet-50",
    hoverBg: "hover:bg-violet-100",
  },
  medical: {
    label: "پزشکی",
    subtitle: "پیگیری منظم، پیشگیری بهتر",
    emoji: "🏥",
    bg: "bg-red-50",
    hoverBg: "hover:bg-red-100",
  },
};

interface Props {
  assessment: RiskAssessment;
  answers: SurveyAnswers;
  config: TierConfig;
}

export function RecommendationsSection({ config }: Props) {
  return (
    <section
      aria-label="توصیه‌های روزانه"
      className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
      dir="rtl"
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="text-base" aria-hidden="true">💡</span>
        <h2 className="text-sm font-bold text-slate-800">توصیه‌های روزانه</h2>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {config.recommendationCategories.map((cat) => {
          const meta = CATEGORY_META[cat];
          return (
            <button
              key={cat}
              type="button"
              className={`flex flex-col gap-2 rounded-xl p-4 text-right transition-colors
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                active:scale-[0.98] ${meta.bg} ${meta.hoverBg}`}
              aria-label={`باز کردن توصیه‌های ${meta.label}`}
            >
              <span className="text-2xl" aria-hidden="true">{meta.emoji}</span>
              <span className="text-sm font-bold text-slate-800">{meta.label}</span>
              <span className="text-xs leading-5 text-slate-500">{meta.subtitle}</span>
              <div className="mt-auto flex items-center gap-1 text-xs font-medium text-slate-400">
                <span>مشاهده</span>
                <span aria-hidden="true">←</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
