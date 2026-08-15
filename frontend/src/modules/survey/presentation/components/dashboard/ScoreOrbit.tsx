// src/modules/survey/presentation/components/dashboard/ScoreOrbit.tsx

import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";

import { RiskTier } from "@survey/domain/entities/risk-assessment.entity";

import { AnimatedNumber } from "./AnimatedNumber";
import { ORGAN_META } from "./organ-meta";

interface Props {
  /** Total risk score, or null before the first assessment. */
  score: number | null;
  tier: RiskTier | null;
  levelLabel: string | null;
}

const TIER_VISUAL: Record<RiskTier, { fill: number; hex: string }> = {
  [RiskTier.Low]: { fill: 0.28, hex: "#0d9488" },
  [RiskTier.Moderate]: { fill: 0.5, hex: "#ca8a04" },
  [RiskTier.Elevated]: { fill: 0.72, hex: "#ea580c" },
  [RiskTier.Critical]: { fill: 0.92, hex: "#dc2626" },
};

const RING_RADIUS = 84;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/**
 * The dashboard centerpiece: a score ring with a slow orbit of organ icons
 * around it — the web translation of the reference image's "body scan" hub.
 */
export function ScoreOrbit({ score, tier, levelLabel }: Props) {
  const reduceMotion = useReducedMotion();
  const empty = score === null || tier === null;
  const visual = empty ? null : TIER_VISUAL[tier];

  return (
    <div className="relative mx-auto grid aspect-square w-full max-w-[340px] place-items-center">
      {/* Breathing halo behind everything. */}
      {!reduceMotion && (
        <motion.div
          aria-hidden
          className="absolute inset-6 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(10,155,164,0.18), transparent 68%)" }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Orbiting organ icons — the whole ring rotates, each bubble counter-rotates. */}
      <motion.div
        aria-hidden
        className="absolute inset-0"
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      >
        {ORGAN_META.map((meta, index) => {
          const angle = (index / ORGAN_META.length) * 2 * Math.PI - Math.PI / 2;
          const Icon = meta.icon;
          return (
            <motion.div
              key={meta.key}
              className="absolute grid h-11 w-11 place-items-center rounded-full border border-white/60 bg-surface/90 shadow-card backdrop-blur-sm"
              style={{
                left: `calc(50% + ${Math.cos(angle) * 47}% - 22px)`,
                top: `calc(50% + ${Math.sin(angle) * 47}% - 22px)`,
              }}
              animate={reduceMotion ? undefined : { rotate: -360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            >
              <Icon
                className={`h-5 w-5 ${empty ? "text-ink-subtle" : "text-day-primary"}`}
                strokeWidth={2}
              />
            </motion.div>
          );
        })}
      </motion.div>

      {/* Score ring. */}
      <svg viewBox="0 0 200 200" className="absolute inset-[13%] -rotate-90">
        <circle
          cx="100"
          cy="100"
          r={RING_RADIUS}
          fill="none"
          stroke="var(--line)"
          strokeWidth="10"
          strokeDasharray={empty ? "3 8" : undefined}
        />
        {!empty && visual && (
          <motion.circle
            cx="100"
            cy="100"
            r={RING_RADIUS}
            fill="none"
            stroke={visual.hex}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            initial={{ strokeDashoffset: RING_CIRCUMFERENCE }}
            animate={{ strokeDashoffset: RING_CIRCUMFERENCE * (1 - visual.fill) }}
            transition={{ type: "spring", stiffness: 40, damping: 18, delay: 0.3 }}
          />
        )}
      </svg>

      {/* Center readout. */}
      <div className="relative z-10 flex flex-col items-center gap-1 text-center">
        {empty ? (
          <>
            <Sparkles className="h-6 w-6 text-day-primary" />
            <span className="text-4xl font-black text-ink-subtle">۰</span>
            <span className="max-w-[9rem] text-xs leading-6 text-ink-muted">
              هنوز ارزیابی انجام نشده
            </span>
          </>
        ) : (
          <>
            <span className="text-[11px] font-semibold text-ink-subtle">نمره کل ریسک</span>
            <AnimatedNumber
              value={score}
              fractionDigits={1}
              delay={0.3}
              className="text-5xl font-black tabular-nums text-ink"
            />
            {levelLabel && visual && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.7 }}
                className="rounded-full px-3 py-1 text-xs font-bold text-white shadow-sm"
                style={{ backgroundColor: visual.hex }}
              >
                {levelLabel}
              </motion.span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
