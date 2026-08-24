// src/modules/survey/presentation/components/advice/shared/BmiVisualizerSection.tsx

import { toPersianDigits } from "@core/text/digits";

import type { BodyMetrics } from "@survey/domain/value-objects/body-metrics.vo";
import type { TierConfig } from "./TierConfig";

interface Props {
  bodyMetrics: BodyMetrics;
  config: TierConfig;
}

const BMI_RANGES = [
  { label: "کمبود وزن", min: 0,    max: 18.5,     colorClass: "bg-sky-400"     },
  { label: "نرمال",     min: 18.5, max: 25,       colorClass: "bg-emerald-400" },
  { label: "اضافه وزن", min: 25,   max: 30,       colorClass: "bg-amber-400"   },
  { label: "چاقی",      min: 30,   max: Infinity, colorClass: "bg-red-400"     },
] as const;

const LRI = "\u2066"; // Left-to-Right Isolate
const PDI = "\u2069"; // Pop Directional Isolate

/** برچسب بازه را با ترتیب منطقی تضمین‌شده می‌سازد. */
function formatRange(min: number, max: number): string {
  const fa = (n: number) => toPersianDigits(String(n));
  if (min === 0)          return `${LRI}<\u00A0${fa(max)}${PDI}`;
  if (!isFinite(max))     return `${LRI}\u2265\u00A0${fa(min)}${PDI}`;
  return `${LRI}${fa(min)}\u00A0\u2013\u00A0${fa(max - 0.1)}${PDI}`;
}


const AXIS_MIN = 15;
const AXIS_MAX = 35;

const AXIS_TICKS = [
  { value: 15,   label: "۱۵",   align: "start"  },
  { value: 18.5, label: "۱۸.۵", align: "center" },
  { value: 25,   label: "۲۵",   align: "center" },
  { value: 30,   label: "۳۰",   align: "center" },
  { value: 35,   label: "۳۵+",  align: "end"    },
] as const;

const BAR_SEGMENTS = [
  { from: 15,   to: 18.5, colorClass: "bg-sky-300"     },
  { from: 18.5, to: 25,   colorClass: "bg-emerald-400" },
  { from: 25,   to: 30,   colorClass: "bg-amber-400"   },
  { from: 30,   to: 35,   colorClass: "bg-red-400"     },
] as const;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

function getBmiCategory(bmi: number) {
  return BMI_RANGES.find((r) => bmi >= r.min && bmi < r.max) ?? BMI_RANGES[3];
}

function bmiToPercent(bmi: number) {
  return ((clamp(bmi, AXIS_MIN, AXIS_MAX) - AXIS_MIN) / (AXIS_MAX - AXIS_MIN)) * 100;
}

const tickTransform = (align: "start" | "center" | "end") =>
  align === "start"
    ? "translateX(0)"
    : align === "end"
      ? "translateX(-100%)"
      : "translateX(-50%)";

export function BmiVisualizerSection({ bodyMetrics, config }: Props) {
  const bmi = bodyMetrics.bmi;
  const category = getBmiCategory(bmi);
  const markerPercent = bmiToPercent(bmi);

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
        <div className="flex flex-col items-center gap-1.5">
          <span
            className={`text-4xl font-black tabular-nums ${config.accentTextClass}`}
            aria-label={`BMI: ${bmi.toFixed(1)}`}
          >
            {toPersianDigits(bmi.toFixed(1))}
          </span>
          <span
            className={`rounded-full px-3 py-0.5 text-xs font-semibold ${config.accentBgClass} ${config.accentTextClass}`}
          >
            {category.label}
          </span>
          <span className="mt-1 text-xs text-slate-400">
            محدوده سالم:{" "}
            <span dir="ltr" className="inline-block tabular-nums">
              ۱۸.۵ – ۲۴.۹
            </span>
          </span>
        </div>

        {/* نوار، نشانگر و محور در یک جهت LTR تا محور از چپ به راست صعودی بماند */}
        <div className="flex flex-1 flex-col gap-3" dir="ltr">
          <div className="relative">
            <div
              className="flex h-3 w-full overflow-hidden rounded-full"
              role="img"
              aria-label={`محدوده‌های BMI؛ شاخص شما ${bmi.toFixed(1)}`}
            >
              {BAR_SEGMENTS.map((segment) => (
                <div
                  key={segment.from}
                  className={segment.colorClass}
                  style={{
                    width: `${((segment.to - segment.from) / (AXIS_MAX - AXIS_MIN)) * 100}%`,
                  }}
                />
              ))}
            </div>

            <div
              className={`absolute top-1/2 h-3.5 w-3.5 rounded-full border-2 border-white shadow-md ${category.colorClass}`}
              style={{ left: `${markerPercent}%`, transform: "translate(-50%, -50%)" }}
              aria-hidden="true"
            />
          </div>

          <div className="relative h-4">
            {AXIS_TICKS.map((tick) => (
              <span
                key={tick.value}
                dir="ltr"
                className="absolute top-0 text-xs tabular-nums text-slate-400"
                style={{
                  left: `${bmiToPercent(tick.value)}%`,
                  transform: tickTransform(tick.align),
                }}
              >
                {tick.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
