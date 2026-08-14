// src/modules/survey/presentation/components/advice/shared/BmiVisualizerSection.tsx

import type { BodyMetrics } from "@survey/domain/value-objects/body-metrics.vo";
import type { TierConfig } from "./TierConfig";

interface Props {
  bodyMetrics: BodyMetrics;
  config: TierConfig;
}

const BMI_RANGES = [
  { label: "کمبود وزن",  min: 0,    max: 18.5, colorClass: "bg-sky-400"     },
  { label: "نرمال",      min: 18.5, max: 25,   colorClass: "bg-emerald-400" },
  { label: "اضافه وزن", min: 25,   max: 30,   colorClass: "bg-amber-400"   },
  { label: "چاق",        min: 30,   max: 60,   colorClass: "bg-red-400"     },
] as const;

function getBmiCategory(bmi: number) {
  return BMI_RANGES.find((r) => bmi >= r.min && bmi < r.max) ?? BMI_RANGES[3];
}

/** نقطه نشانگر: bmi=15 → 0%, bmi=35 → 100% */
function bmiToPercent(bmi: number) {
  return Math.min(Math.max(((bmi - 15) / 20) * 100, 1), 99);
}

export function BmiVisualizerSection({ bodyMetrics, config }: Props) {
  const bmi = bodyMetrics.bmi;
  const category = getBmiCategory(bmi);

  return (
    <section
      aria-label="شاخص توده بدنی"
      className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
      dir="rtl"
    >
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-sm font-bold text-slate-800">شاخص توده بدنی (BMI)</h2>
        <span className="text-xs text-slate-400">شاخص توده بدنی شما</span>
      </div>

      <div className="flex items-center gap-6">
        {/* مقدار عددی */}
        <div className="flex flex-col items-center gap-1.5">
          <span
            className={`text-4xl font-black tabular-nums ${config.accentTextClass}`}
            aria-label={`BMI: ${bmi.toFixed(1)}`}
          >
            {bmi.toFixed(1)}
          </span>
          <span
            className={`rounded-full px-3 py-0.5 text-xs font-semibold ${config.accentBgClass} ${config.accentTextClass}`}
          >
            {category.label}
          </span>
          <span className="mt-1 text-xs text-slate-400">محدوده سالم: ۱۸.۵ – ۲۴.۹</span>
        </div>

        {/* نوار range + نشانگر */}
        <div className="flex flex-1 flex-col gap-3">
          {/* نوار رنگی */}
          <div
            className="flex h-3 w-full overflow-hidden rounded-full"
            role="img"
            aria-label="محدوده‌های BMI"
          >
            <div className="flex-[3.5] bg-sky-300" />
            <div className="flex-[6.5] bg-emerald-400" />
            <div className="flex-[5] bg-amber-400" />
            <div className="flex-[5] bg-red-400" />
          </div>

          {/* نشانگر موقعیت */}
          <div className="relative h-3">
            <div
              className={`absolute top-0 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-white shadow-md ${category.colorClass}`}
              style={{ left: `${bmiToPercent(bmi)}%` }}
              aria-hidden="true"
            />
          </div>

          {/* برچسب‌های محور */}
          <div className="flex justify-between text-xs text-slate-400">
            <span>۱۵</span>
            <span>۱۸.۵</span>
            <span>۲۵</span>
            <span>۳۰</span>
            <span>۳۵+</span>
          </div>
        </div>
      </div>
    </section>
  );
}
