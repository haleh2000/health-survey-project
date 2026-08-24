// src/modules/survey/presentation/components/dashboard/BmiComparisonChart.tsx

import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowUp, Check } from "lucide-react";

import { toPersianDigits } from "@core/text/digits";

import { BMI_RANGES, BmiActiveRangeRow, bmiCategory } from "./BmiGauge";

interface Props {
  bmi: number | null;
}

const AXIS_MIN = 15;
const AXIS_MAX = 40;
const HEALTHY_MIN = 18.5;
const HEALTHY_MAX = 24.9;

const AXIS_TICKS = [18.5, 25, 30];

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const toPct = (bmi: number) =>
  ((clamp(bmi, AXIS_MIN, AXIS_MAX) - AXIS_MIN) / (AXIS_MAX - AXIS_MIN)) * 100;

const oneDecimal = (value: number) => toPersianDigits(value.toFixed(1));

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

  const StatusIcon = inRange ? Check : deviation > 0 ? ArrowUp : ArrowDown;
  const statusColor = inRange ? "#10b981" : category.hex;

  return (
    <div className="flex flex-col gap-4">
      {/* نوار محدوده‌های BMI */}
      <div>
        <div className="relative mb-10 mt-8" dir="ltr">
          {/* نشانگر مقدار فعلی */}
          <motion.div
            className="absolute -top-7 z-10"
            style={{ transform: "translateX(-50%)" }}
            initial={
              reduceMotion
                ? false
                : { left: `${toPct(HEALTHY_MIN)}%`, opacity: 0 }
            }
            animate={{ left: `${toPct(bmi)}%`, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 90,
              damping: 18,
              delay: 0.2,
            }}
          >
            <bdi
              dir="ltr"
              className="block whitespace-nowrap rounded-lg px-2 py-0.5 text-[11px] font-black tabular-nums text-white shadow-sm"
              style={{ backgroundColor: category.hex }}
            >
              {oneDecimal(bmi)}
            </bdi>

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
              1,
            )} است؛ محدوده سالم ${HEALTHY_MIN} تا ${HEALTHY_MAX}`}
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
                    width: `${((to - from) / (AXIS_MAX - AXIS_MIN)) * 100}%`,
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
            style={{ transform: "translateX(-50%)" }}
            initial={reduceMotion ? false : { left: `${toPct(HEALTHY_MIN)}%` }}
            animate={{ left: `${toPct(bmi)}%` }}
            transition={{
              type: "spring",
              stiffness: 90,
              damping: 18,
              delay: 0.2,
            }}
            aria-hidden
          />

          {/* اعداد محور */}
          {AXIS_TICKS.map((tick) => (
            <bdi
              key={tick}
              dir="ltr"
              className="absolute top-5 text-[10px] tabular-nums text-ink-subtle"
              style={{ left: `${toPct(tick)}%`, transform: "translateX(-50%)" }}
            >
              {toPersianDigits(String(tick))}
            </bdi>
          ))}

          {/* برچسب محدوده سالم */}
          <span
            dir="rtl"
            className="absolute top-9 whitespace-nowrap text-[10px] font-semibold text-emerald-600"
            style={{
              left: `${toPct((HEALTHY_MIN + HEALTHY_MAX) / 2)}%`,
              transform: "translateX(-50%)",
            }}
          >
            محدوده سالم
          </span>
        </div>

        {/* وضعیت نسبت به محدوده سالم */}
        {/* <div
          className="flex items-center justify-center gap-1.5 text-[11px] font-semibold"
          style={{ color: statusColor }}
        >
          <StatusIcon className="size-3.5" aria-hidden />
          {inRange ? (
            <span>در محدوده سالم قرار داری</span>
          ) : (
            <span>
              <bdi dir="ltr" className="tabular-nums">
                {oneDecimal(Math.abs(deviation))}
              </bdi>{" "}
              واحد {deviation > 0 ? "بالاتر" : "پایین‌تر"} از محدوده سالم
            </span>
          )}
        </div> */}
      </div>

      <BmiActiveRangeRow bmi={bmi} />
    </div>
  );
}
