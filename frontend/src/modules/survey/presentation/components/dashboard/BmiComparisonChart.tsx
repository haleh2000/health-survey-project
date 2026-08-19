// src/modules/survey/presentation/components/dashboard/BmiComparisonChart.tsx
// ─────────────────────────────────────────────────────────────────────────────
// نمودار مقایسهٔ «چیزی که باید باشد» با «چیزی که هست»:
//   ۱) نوار محدوده‌های BMI با نشانگر مقدار فعلی و هایلایت محدوده سالم
//   ۲) مقایسهٔ وزن فعلی با بازهٔ وزن سالم (وقتی قد ثبت شده باشد)
// ─────────────────────────────────────────────────────────────────────────────
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowUp, Check } from "lucide-react";

import { toPersianDigits } from "@core/text/digits";

import { BMI_RANGES, bmiCategory } from "./BmiGauge";

interface Props {
  bmi: number | null;
  /** قد به سانتی‌متر — اگر موجود باشد، اختلاف بر حسب کیلوگرم هم نشان داده می‌شود */
  heightCm?: number | null;
  weightKg?: number | null;
}

/** بازهٔ محور نمودار: کل نوار از BMI ۱۵ تا ۴۰ کشیده می‌شود. */
const AXIS_MIN = 15;
const AXIS_MAX = 40;
const HEALTHY_MIN = 18.5;
const HEALTHY_MAX = 24.9;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const toPct = (bmi: number) => ((clamp(bmi, AXIS_MIN, AXIS_MAX) - AXIS_MIN) / (AXIS_MAX - AXIS_MIN)) * 100;

const oneDecimal = (value: number) => toPersianDigits(value.toFixed(1));

/** فاصله تا نزدیک‌ترین لبهٔ محدوده سالم (منفی = پایین‌تر از نرمال) */
function deviationOf(bmi: number): number {
  if (bmi < HEALTHY_MIN) return bmi - HEALTHY_MIN;
  if (bmi > HEALTHY_MAX) return bmi - HEALTHY_MAX;
  return 0;
}

export function BmiComparisonChart({ bmi, heightCm, weightKg }: Props) {
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

  const meters = heightCm ? heightCm / 100 : null;
  const healthyMinKg = meters ? HEALTHY_MIN * meters * meters : null;
  const healthyMaxKg = meters ? HEALTHY_MAX * meters * meters : null;
  const currentKg = weightKg ?? (meters ? bmi * meters * meters : null);
  const deltaKg =
    currentKg != null && healthyMinKg != null && healthyMaxKg != null
      ? currentKg > healthyMaxKg
        ? currentKg - healthyMaxKg
        : currentKg < healthyMinKg
          ? currentKg - healthyMinKg
          : 0
      : null;

  return (
    <div className="flex flex-col gap-5">
      {/* ── ۱) نوار محدوده‌ها ───────────────────────────────────────────── */}
      <div>
        <div className="mb-8 mt-2 relative">
          {/* نشانگر مقدار فعلی */}
          <motion.div
            className="absolute -top-7 z-10"
            style={{ transform: "translateX(50%)" }}
            initial={{ right: `${toPct(HEALTHY_MIN)}%`, opacity: 0 }}
            animate={{ right: `${toPct(bmi)}%`, opacity: 1 }}
            transition={{ type: "spring", stiffness: 90, damping: 18, delay: 0.2 }}
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
          <div className="flex h-4 w-full overflow-hidden rounded-full" role="img"
               aria-label={`شاخص توده بدنی شما ${bmi.toFixed(1)} است؛ محدوده سالم ۱۸.۵ تا ۲۴.۹`}>
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
                    // فاصلهٔ ۲ پیکسلی بین باندها تا مرزها خوانا بمانند
                    borderInline: "1px solid var(--surface)",
                  }}
                />
              );
            })}
          </div>

          {/* خط عمودی مقدار فعلی روی نوار */}
          <motion.div
            className="absolute top-0 h-4 w-[3px] rounded-full bg-white shadow"
            style={{ transform: "translateX(50%)" }}
            initial={{ right: `${toPct(HEALTHY_MIN)}%` }}
            animate={{ right: `${toPct(bmi)}%` }}
            transition={{ type: "spring", stiffness: 90, damping: 18, delay: 0.2 }}
            aria-hidden
          />

          {/* مرزهای عددی */}
          {[18.5, 25, 30].map((tick) => (
            <span
              key={tick}
              className="absolute top-5 text-[10px] tabular-nums text-ink-subtle"
              style={{ right: `${toPct(tick)}%`, transform: "translateX(50%)" }}
            >
              {toPersianDigits(String(tick))}
            </span>
          ))}
          {/* برچسب زیر باند سبز */}
          <span
            className="absolute top-5 whitespace-nowrap text-[10px] font-semibold text-emerald-600"
            style={{ right: `${toPct((HEALTHY_MIN + HEALTHY_MAX) / 2)}%`, transform: "translateX(50%)" }}
          >
            محدوده سالم
          </span>
        </div>

        {/* وضعیت نسبت به نرمال */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold text-white"
            style={{ backgroundColor: category.hex }}
          >
            {inRange ? <Check className="h-3.5 w-3.5" /> : deviation > 0 ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
            {category.label}
          </span>
          <span className="text-[11px] text-ink-muted">
            {inRange ? (
              "شاخص شما داخل محدوده سالم است."
            ) : (
              <>
                {oneDecimal(Math.abs(deviation))} واحد {deviation > 0 ? "بالاتر" : "پایین‌تر"} از محدوده سالم
                {deltaKg != null && deltaKg !== 0 && (
                  <> — حدود {toPersianDigits(Math.abs(deltaKg).toFixed(1))} کیلوگرم {deltaKg > 0 ? "بیشتر" : "کمتر"} از وزن متناسب</>
                )}
              </>
            )}
          </span>
        </div>
      </div>

      {/* ── ۲) مقایسهٔ وزن فعلی با بازهٔ سالم ───────────────────────────── */}
      {currentKg != null && healthyMinKg != null && healthyMaxKg != null && (
        <div className="rounded-2xl border border-line bg-surface/60 p-4">
          <h4 className="mb-3 text-[11px] font-black text-ink">وزن فعلی در برابر وزن متناسب</h4>

          <WeightBar
            label="وزن فعلی شما"
            value={currentKg}
            max={Math.max(currentKg, healthyMaxKg) * 1.15}
            color={category.hex}
            reduceMotion={!!reduceMotion}
            delay={0.15}
          />
          <WeightBar
            label="بازهٔ وزن سالم"
            value={healthyMaxKg}
            from={healthyMinKg}
            max={Math.max(currentKg, healthyMaxKg) * 1.15}
            color="#10b981"
            reduceMotion={!!reduceMotion}
            delay={0.3}
          />

          <p className="mt-3 text-[11px] leading-relaxed text-ink-subtle">
            برای قد {toPersianDigits(String(Math.round(heightCm ?? 0)))} سانتی‌متر، وزن متناسب بین{" "}
            <b className="text-ink">{toPersianDigits(healthyMinKg.toFixed(1))}</b> تا{" "}
            <b className="text-ink">{toPersianDigits(healthyMaxKg.toFixed(1))}</b> کیلوگرم است.
          </p>
        </div>
      )}
    </div>
  );
}

/** یک ردیف میله‌ای؛ با دادن `from` به‌جای میله، یک بازه رسم می‌شود. */
function WeightBar({
  label,
  value,
  from,
  max,
  color,
  reduceMotion,
  delay,
}: {
  label: string;
  value: number;
  from?: number;
  max: number;
  color: string;
  reduceMotion: boolean;
  delay: number;
}) {
  const start = ((from ?? 0) / max) * 100;
  const width = (value / max) * 100 - start;

  return (
    <div className="mb-3 last:mb-0">
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-[11px] font-semibold text-ink-muted">{label}</span>
        <span className="text-[11px] font-bold tabular-nums text-ink">
          {from != null
            ? `${toPersianDigits(from.toFixed(1))} – ${toPersianDigits(value.toFixed(1))} kg`
            : `${toPersianDigits(value.toFixed(1))} kg`}
        </span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-surface-muted">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color, marginInlineStart: `${start}%` }}
          initial={reduceMotion ? false : { width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 22, delay }}
        />
      </div>
    </div>
  );
}
