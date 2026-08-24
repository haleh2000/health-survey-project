// src/modules/survey/presentation/components/dashboard/BmiGauge.tsx

import { motion, useReducedMotion } from "framer-motion";

import { toPersianDigits } from "@core/text/digits";

import { AnimatedNumber } from "./AnimatedNumber";

interface Props {
  bmi: number | null;
}

export const HEALTHY_MIN = 18.5;
export const HEALTHY_MAX = 24.9;


const EN_DASH = "\u2013";

const fa = (value: number) => toPersianDigits(value.toFixed(1).replace(/\.0$/, ""));

const below = (bound: number) => ` ${fa(bound)} <`;
const atLeast = (bound: number) => ` ${fa(bound)} ≥`;
const between = (from: number, to: number) => `${fa(from)} ${EN_DASH} ${fa(to)}`;


export const BMI_RANGES = [
  { label: "کمبود وزن", range: below(18.5), min: 0, max: 18.5, hex: "#38bdf8" },
  { label: "نرمال", range: between(HEALTHY_MIN, HEALTHY_MAX), min: 18.5, max: 25, hex: "#10b981" },
  { label: "اضافه وزن", range: between(25, 29.9), min: 25, max: 30, hex: "#f59e0b" },
  { label: "چاقی", range: atLeast(30), min: 30, max: 99, hex: "#ef4444" },
] as const;

export type BmiRange = (typeof BMI_RANGES)[number];

export const bmiCategory = (bmi: number) =>
  BMI_RANGES.find((r) => bmi >= r.min && bmi < r.max) ?? BMI_RANGES[3];

const fillLevel = (bmi: number) => Math.min(Math.max((bmi - 15) / 20, 0.1), 0.9) * 0.8 + 0.1;

const waterY = (bmi: number) => 200 * (1 - fillLevel(bmi));

const BUBBLES = [
  { cx: 74, r: 2.4, delay: 1.2, duration: 6.4 },
  { cx: 118, r: 1.8, delay: 2.6, duration: 5.8 },
  { cx: 92, r: 1.8, delay: 3.6, duration: 7 },
];

const wavePath = (amplitude: number) =>
  `M0 0 Q 50 ${-amplitude}, 100 0 T 200 0 T 300 0 T 400 0 V 220 H 0 Z`;

export function BmiGauge({ bmi }: Props) {
  const reduceMotion = useReducedMotion();
  const empty = bmi === null;
  const level = empty ? 0.12 : fillLevel(bmi);
  const waterTop = 200 * (1 - level);
  const tint = empty ? "#94a3b8" : bmiCategory(bmi).hex;

  const srLabel = empty
    ? "شاخص توده بدنی محاسبه نشده است"
    : `شاخص توده بدنی شما ${fa(bmi)} است، در دسته ${bmiCategory(bmi).label}. محدوده سالم ${fa(
        HEALTHY_MIN,
      )} تا ${fa(HEALTHY_MAX)}`;

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[240px]">
      <svg viewBox="0 0 200 200" className="h-full w-full" role="img" aria-label={srLabel}>
        <defs>
          <clipPath id="bmi-liquid-clip">
            <circle cx="100" cy="100" r="86" />
          </clipPath>
          <linearGradient id="bmi-water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={tint} stopOpacity="0.95" />
            <stop offset="100%" stopColor={tint} stopOpacity="0.65" />
          </linearGradient>
          <radialGradient id="bmi-glass" cx="0.35" cy="0.28" r="0.85">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Glass rim. */}
        <circle cx="100" cy="100" r="97" fill="none" stroke="var(--line)" strokeWidth="2" />
        <circle cx="100" cy="100" r="90" fill="var(--surface)" stroke="var(--line-strong)" strokeWidth="1.5" />

        <g clipPath="url(#bmi-liquid-clip)">
          {/* Water rises with a spring; two waves drift in opposite directions on top. */}
          <motion.g
            initial={{ y: 200 }}
            animate={{ y: waterTop }}
            transition={{ type: "spring", stiffness: 34, damping: 16, delay: 0.4 }}
          >
            <motion.path
              d={wavePath(9)}
              fill={empty ? "var(--line)" : "url(#bmi-water)"}
              opacity={0.45}
              animate={reduceMotion ? undefined : { x: [0, -200] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            />
            <motion.path
              d={wavePath(6)}
              fill={empty ? "var(--line-strong)" : "url(#bmi-water)"}
              opacity={0.85}
              animate={reduceMotion ? undefined : { x: [-200, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
            />
          </motion.g>

          {!empty && !reduceMotion && BUBBLES.map((bubble) => (
            <motion.circle
              key={bubble.cx}
              cx={bubble.cx}
              r={bubble.r}
              fill="#ffffff"
              opacity={0.35}
              initial={{ cy: 190 }}
              animate={{ cy: waterTop + 6, opacity: [0, 0.4, 0] }}
              transition={{ duration: bubble.duration, repeat: Infinity, delay: bubble.delay, ease: "easeIn" }}
            />
          ))}

          <g>
            <rect
              x="14"
              y={waterY(HEALTHY_MAX)}
              width="172"
              height={waterY(HEALTHY_MIN) - waterY(HEALTHY_MAX)}
              fill="#0e704f"
              opacity="0.12"
            />
            <line
              x1="14"
              y1={waterY(HEALTHY_MAX)}
              x2="186"
              y2={waterY(HEALTHY_MAX)}
              stroke="#0e704f"
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity="0.7"
            />
            <line
              x1="14"
              y1={waterY(HEALTHY_MIN)}
              x2="186"
              y2={waterY(HEALTHY_MIN)}
              stroke="#0e704f"
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity="0.7"
            />
          </g>
        </g>

        <circle cx="100" cy="100" r="86" fill="url(#bmi-glass)" pointerEvents="none" />
        <ellipse cx="64" cy="42" rx="20" ry="8" fill="white" opacity="0.28" transform="rotate(-28 64 42)" />

        <text
          x="52"
          y={waterY(HEALTHY_MIN) - 5}
          textAnchor="middle"
          fontSize="8.5"
          fontWeight="700"
          fill="#0e704f"
          opacity="0.95"
        >
          محدوده سالم
        </text>
      </svg>

      {/* Readout floats above the water line. */}
      <div className="absolute inset-0 grid place-items-center">
        <div className="flex flex-col items-center -translate-y-2 text-center">
          {empty ? (
            <span className="text-3xl font-black text-ink-subtle">—</span>
          ) : (
            <AnimatedNumber
              value={bmi}
              fractionDigits={1}
              delay={0.5}
              className="text-4xl font-black tabular-nums text-ink drop-shadow-sm"
            />
          )}
          <span className="text-xs font-bold tracking-wide text-ink-muted">BMI</span>
          {!empty && (
            <motion.span
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="mt-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm"
              style={{ backgroundColor: bmiCategory(bmi).hex }}
            >
              {bmiCategory(bmi).label}
            </motion.span>
          )}
        </div>
      </div>
    </div>
  );
}

function BmiRangeRow({
  range,
  isActive,
  delay,
}: {
  range: BmiRange;
  isActive: boolean;
  delay: number;
}) {
  return (
    <motion.li
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 26, delay }}
      className={`flex items-center justify-between rounded-xl border px-3 py-2 transition-colors ${
        isActive ? "border-transparent shadow-card mt-10" : "border-line bg-surface/60"
      }`}
      style={isActive ? { backgroundColor: `${range.hex}1a` } : undefined}
    >
      {/* متن فارسی در جریان RTL می‌ماند. */}
      <span className="flex items-center gap-2 text-xs font-semibold text-ink">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: range.hex }} />
        {range.label}
      </span>
      {/* فقط بخش عددی/ریاضی ایزوله و LTR می‌شود. */}
      <bdi dir="ltr" className="text-[13px] tabular-nums text-ink-muted">
        {range.range}
      </bdi>
    </motion.li>
  );
}

export function BmiRangeLegend({ bmi }: Props) {
  const active = bmi === null ? null : bmiCategory(bmi);
  const rest = BMI_RANGES.filter((range) => range.label !== active?.label);

  return (
    <ul className="flex w-full flex-col gap-2">
      {rest.map((range, index) => (
        <BmiRangeRow
          key={range.label}
          range={range}
          isActive={false}
          delay={0.3 + index * 0.08}
        />
      ))}
    </ul>
  );
}

export function BmiActiveRangeRow({ bmi }: Props) {
  if (bmi === null) return null;

  return (
    <ul className="w-full">
      <BmiRangeRow range={bmiCategory(bmi)} isActive delay={0.3} />
    </ul>
  );
}
