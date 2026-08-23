// src/modules/survey/presentation/components/dashboard/BmiComparisonChart.tsx

import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowUp, Check } from "lucide-react";

import { toPersianDigits } from "@core/text/digits";

import { BMI_RANGES, bmiCategory } from "./BmiGauge";

interface Props {
  bmi: number | null;
}

const AXIS_MIN = 15;
const AXIS_MAX = 40;
const HEALTHY_MIN = 18.5;
const HEALTHY_MAX = 24.9;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const toPct = (bmi: number) =>
  ((clamp(bmi, AXIS_MIN, AXIS_MAX) - AXIS_MIN) /
    (AXIS_MAX - AXIS_MIN)) *
  100;

const oneDecimal = (value: number) =>
  toPersianDigits(value.toFixed(1));

/** فاصله تا نزدیک‌ترین لبهٔ محدوده سالم */
function deviationOf(bmi: number): number {
  if (bmi < HEALTHY_MIN) return bmi - HEALTHY_MIN;
  if (bmi > HEALTHY_MAX) return bmi - HEALTHY_MAX;
  return 0;
}

export function BmiComparisonChart({ bmi }: Props) {
  const reduceMotion = useReducedMotion();

  if (bmi === null) {
    return (
      <div className="grid h-40 place-items-center rounded-2xl border border-dashed border-line text-xs text-ink-subtle">
        پس از اولین ارزیابی، نمودار مقایسه با محدوده نرمال اینجا نمایش داده می‌شود.
      </div>
    );
  }

  const category = bmiCategory(bmi);
  const deviation = deviationOf(bmi);
  const inRange = deviation === 0;

  return (
    <div className="flex flex-col gap-4">
      {/* نوار محدوده‌های BMI */}
      <div>
        <div className="relative mb-8 mt-2">
          {/* نشانگر مقدار فعلی */}
          <motion.div
            className="absolute -top-7 z-10"
            style={{ transform: "translateX(50%)" }}
            initial={
              reduceMotion
                ? false
                : { right: `${toPct(HEALTHY_MIN)}%`, opacity: 0 }
            }
            animate={{
              right: `${toPct(bmi)}%`,
              opacity: 1,
            }}
            transition={{
              type: "spring",
              stiffness: 90,
              damping: 18,
              delay: 0.2,
            }}
          >
            <span
              className="block whitespace-nowrap rounded-lg px-2 py-0.5 text-[11px] font-black tabular-nums text-white shadow-sm"
              style={{ backgroundColor: category.hex }}
            >
              {oneDecimal(bmi)}
            </span>

            <span
              className="mx-auto block h-0 w-0 border-x-4 border-t-4 border-x-transparent"
              style={{ borderTopColor: category.hex }}
              aria-hidden
            />
          </motion.div>

          {/* خود نوار */}
          <div
            className="flex h-4 w-full overflow-hidden rounded-full"
            role="img"
            aria-label={`شاخص توده بدنی شما ${bmi.toFixed(
              1
            )} است؛ محدوده سالم ۱۸.۵ تا ۲۴.۹`}
          >
            {BMI_RANGES.map((range) => {
              const from = Math.max(range.min, AXIS_MIN);
              const to = Math.min(range.max, AXIS_MAX);
              const isHealthy = range.label === "نرمال";

              return (
                <div
                  key={range.label}
                  className="h-full"
                  style={{
                    width: `${
                      ((to - from) / (AXIS_MAX - AXIS_MIN)) * 100
                    }%`,
                    backgroundColor: range.hex,
                    opacity: isHealthy ? 1 : 0.28,
                    borderInline: "1px solid var(--surface)",
                  }}
                />
              );
            })}
          </div>

          {/* خط مقدار فعلی */}
          <motion.div
            className="absolute top-0 h-4 w-[3px] rounded-full bg-white shadow"
            style={{ transform: "translateX(50%)" }}
            initial={
              reduceMotion
                ? false
                : { right: `${toPct(HEALTHY_MIN)}%` }
            }
            animate={{ right: `${toPct(bmi)}%` }}
            transition={{
              type: "spring",
              stiffness: 90,
              damping: 18,
              delay: 0.2,
            }}
            aria-hidden
          />

          {/* اعداد محور */}
          {[18.5, 25, 30].map((tick) => (
            <span
              key={tick}
              className="absolute top-5 text-[10px] tabular-nums text-ink-subtle"
              style={{
                right: `${toPct(tick)}%`,
                transform: "translateX(50%)",
              }}
            >
              {toPersianDigits(String(tick))}
            </span>
          ))}

          {/* محدوده سالم */}
          <span
            className="absolute top-5 whitespace-nowrap text-[10px] font-semibold text-emerald-600"
            style={{
              right: `${toPct(
                (HEALTHY_MIN + HEALTHY_MAX) / 2
              )}%`,
              transform: "translateX(50%)",
            }}
          >
            محدوده سالم
          </span>
        </div>

        {/* وضعیت نسبت به محدوده سالم */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold text-white"
            style={{ backgroundColor: category.hex }}
          >
            {inRange ? (
              <Check className="h-3.5 w-3.5" />
            ) : deviation > 0 ? (
              <ArrowUp className="h-3.5 w-3.5" />
            ) : (
              <ArrowDown className="h-3.5 w-3.5" />
            )}

            {category.label}
          </span>

          {!inRange && (
            <span className="text-[11px] text-ink-muted">
              {oneDecimal(Math.abs(deviation))} واحد{" "}
              {deviation > 0 ? "بالاتر" : "پایین‌تر"} از محدوده سالم
            </span>
          )}
        </div>
      </div>
    </div>
  );
}