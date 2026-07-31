// src/modules/survey/presentation/components/advice/Group1Advice.tsx
import { MindPeaceSection } from "./MindPeaceSection";
import { NutritionSection } from "./NutritionSection";
import { WeightLossSection } from "./WeightLossSection";

interface Group1AdviceProps {
  onPrint: () => void;
  onShare: () => void;
}

export function Group1Advice({ onPrint, onShare }: Group1AdviceProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl bg-gradient-to-l from-pink-100 to-pink-200 px-6 py-8 text-center">
        <h2 className="text-xl font-bold text-ink">
          ۱. گروه پر ریسک (با بیماری قطعی)
        </h2>
      </div>

      <NutritionSection />
      <WeightLossSection />
      <MindPeaceSection />

      <div className="flex gap-3">
        <button
          onClick={onShare}
          className="flex-1 rounded-xl border-2 border-cyan-400 bg-white px-6 py-3 text-sm font-semibold text-cyan-700 hover:bg-cyan-50"
        >
          اشتراک‌گذاری
        </button>
        <button
          onClick={onPrint}
          className="flex-1 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
        >
          پرینت
        </button>
      </div>
    </div>
  );
}
