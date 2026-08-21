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

      {/* ── ۲) بازهٔ وزن سالم روی یک خطِ عددی ──────────────────────────── */}
      {currentKg != null && healthyMinKg != null && healthyMaxKg != null && (
        <HealthyWeightRange
          currentKg={currentKg}
          healthyMinKg={healthyMinKg}
          healthyMaxKg={healthyMaxKg}
          heightCm={heightCm ?? null}
          deltaKg={deltaKg ?? 0}
          currentColor={category.hex}
          reduceMotion={!!reduceMotion}
        />
      )}
    </div>
  );
}

/**
 * بازهٔ وزن سالم روی یک «خطِ عددی» ساده.
 *
 * به‌جای دو میلهٔ جدا (که معلوم نمی‌کرد بازه از کجا تا کجاست)، همه چیز روی یک
 * محورِ واحد نشان داده می‌شود: باندِ سبز = بازهٔ سالم با عددِ دو سرش، و نشانگرِ
 * وزن فعلی دقیقاً روی همان محور. پس کاربر با یک نگاه می‌بیند داخل بازه است یا
 * بیرونش — و چقدر فاصله دارد.
 */
function HealthyWeightRange({
  currentKg,
  healthyMinKg,
  healthyMaxKg,
  heightCm,
  deltaKg,
  currentColor,
  reduceMotion,
}: {
  currentKg: number;
  healthyMinKg: number;
  healthyMaxKg: number;
  heightCm: number | null;
  deltaKg: number;
  currentColor: string;
  reduceMotion: boolean;
}) {
  /** محور کمی از بازهٔ سالم و وزن فعلی بازتر است تا هر دو با حاشیه دیده شوند. */
  const span = Math.max(healthyMaxKg - healthyMinKg, 1);
  const axisMin = Math.floor(Math.min(healthyMinKg, currentKg) - span * 0.55);
  const axisMax = Math.ceil(Math.max(healthyMaxKg, currentKg) + span * 0.55);
  const pos = (kg: number) => ((clamp(kg, axisMin, axisMax) - axisMin) / (axisMax - axisMin)) * 100;

  const bandStart = pos(healthyMinKg);
  const bandWidth = pos(healthyMaxKg) - bandStart;
  const inRange = deltaKg === 0;
  const kg = (value: number) => toPersianDigits(value.toFixed(1));

  return (
    <div className="rounded-2xl border border-line bg-surface/60 p-4">
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
        <h4 className="text-[11px] font-black text-ink">بازهٔ وزن سالم شما</h4>
        <span className="text-[11px] font-bold tabular-nums text-emerald-600">
          {kg(healthyMinKg)} تا {kg(healthyMaxKg)} کیلوگرم
        </span>
      </div>
      <p className="mb-6 text-[11px] leading-relaxed text-ink-subtle">
        {heightCm != null && heightCm > 0 && (
          <>برای قد {toPersianDigits(String(Math.round(heightCm)))} سانتی‌متر — </>
        )}
        هر وزنی داخل نوار سبز، وزنِ متناسب با قد شماست.
      </p>

      {/* خطِ عددی */}
      <div className="relative mb-2 h-3">
        {/* محور خاکستری = کل بازهٔ نمایش */}
        <div className="absolute inset-x-0 top-0 h-3 rounded-full bg-surface-muted" />

        {/* باندِ سبز = بازهٔ سالم */}
        <motion.div
          className="absolute top-0 h-3 rounded-full bg-emerald-500/90"
          style={{ right: `${bandStart}%` }}
          initial={reduceMotion ? false : { width: 0 }}
          animate={{ width: `${bandWidth}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 22, delay: 0.15 }}
        />

        {/* لبه‌های بازه با عدد */}
        {[
          { value: healthyMinKg, at: bandStart },
          { value: healthyMaxKg, at: bandStart + bandWidth },
        ].map((edge) => (
          <span
            key={edge.value}
            className="absolute top-3 flex flex-col items-center"
            style={{ right: `${edge.at}%`, transform: "translateX(50%)" }}
          >
            <span className="h-2 w-px bg-emerald-600/70" aria-hidden />
            <span className="text-[10px] font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
              {kg(edge.value)}
            </span>
          </span>
        ))}

        {/* نشانگر وزن فعلی */}
        <motion.div
          className="absolute -top-7 z-10 flex flex-col items-center"
          style={{ transform: "translateX(50%)" }}
          initial={reduceMotion ? false : { right: `${bandStart + bandWidth / 2}%`, opacity: 0 }}
          animate={{ right: `${pos(currentKg)}%`, opacity: 1 }}
          transition={{ type: "spring", stiffness: 90, damping: 18, delay: 0.25 }}
        >
          <span
            className="whitespace-nowrap rounded-lg px-2 py-0.5 text-[10px] font-black tabular-nums text-white shadow-sm"
            style={{ backgroundColor: currentColor }}
          >
            وزن شما {kg(currentKg)}
          </span>
          <span
            className="h-0 w-0 border-x-4 border-t-4 border-x-transparent"
            style={{ borderTopColor: currentColor }}
            aria-hidden
          />
          <span className="h-3 w-[3px] rounded-full" style={{ backgroundColor: currentColor }} aria-hidden />
        </motion.div>
      </div>

      {/* جمع‌بندی به زبان ساده */}
      <p className="mt-6 flex flex-wrap items-center gap-1.5 text-[11px] leading-relaxed">
        {inRange ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 font-bold text-emerald-700 dark:text-emerald-400">
            <Check className="h-3.5 w-3.5" />
            وزن شما داخل بازهٔ سالم است
          </span>
        ) : (
          <>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-bold text-white"
              style={{ backgroundColor: currentColor }}
            >
              {deltaKg > 0 ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
              {kg(Math.abs(deltaKg))} کیلوگرم {deltaKg > 0 ? "بیشتر" : "کمتر"} از بازهٔ سالم
            </span>
            <span className="text-ink-subtle">
              با {deltaKg > 0 ? "کاهش" : "افزایش"} {kg(Math.abs(deltaKg))} کیلوگرم، وارد نوار سبز می‌شوید.
            </span>
          </>
        )}
      </p>
    </div>
  );
}
