// src/modules/survey/presentation/components/dashboard/ScoreOrbit.tsx

import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";

import { RiskTier } from "@survey/domain/entities/risk-assessment.entity";
import { toPersianDigits } from "@core/text/digits";
import { ORGAN_META, type OrganKey } from "./organ-meta";
import { scoreToTier } from "./organ-meta";
import { OrganIcon } from "../../../../../design-system/illustrations/OrganIcon";

interface Props {
  tier: RiskTier | null;
  onOrganClick?: (key: OrganKey) => void;
  organRisks?: Partial<Record<OrganKey, { tier: RiskTier }>>;
}

const TIER_VISUAL: Record<RiskTier, { fill: number; hex: string }> = {
  [RiskTier.Low]:      { fill: 0.28, hex: "#0d9488" },
  [RiskTier.Moderate]: { fill: 0.50, hex: "#ca8a04" },
  [RiskTier.Elevated]: { fill: 0.72, hex: "#ea580c" },
  [RiskTier.Critical]: { fill: 0.92, hex: "#dc2626" },
};

const ATTENTION_TIERS = new Set<RiskTier>([
  RiskTier.Moderate,
  RiskTier.Elevated,
  RiskTier.Critical,
]);

const RING_RADIUS = 84;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export function ScoreOrbit({ tier, onOrganClick, organRisks }: Props) {
  const reduceMotion = useReducedMotion();
  const empty = tier === null;
  const visual = empty ? null : TIER_VISUAL[tier];

  const attentionCount = organRisks
    ? Object.values(organRisks).filter((r) => r && ATTENTION_TIERS.has(r.tier)).length
    : 0;

  return (
    <div className="relative mx-auto grid aspect-square w-full max-w-[340px] place-items-center">
      {/* Breathing halo */}
      {!reduceMotion && (
        <motion.div
          aria-hidden
          className="absolute inset-6 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(10,155,164,0.18), transparent 68%)" }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Orbiting organ icons */}
      <motion.div
        aria-hidden={!onOrganClick}
        className="absolute inset-0"
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      >
        {ORGAN_META.map((meta, index) => {
          const angle = (index / ORGAN_META.length) * 2 * Math.PI - Math.PI / 2;
          const organTier = organRisks?.[meta.key]?.tier ?? (empty ? RiskTier.Low : RiskTier.Low);
          const isClickable = !!onOrganClick;

          return (
            <motion.button
              key={meta.key}
              type="button"
              aria-label={meta.label}
              onClick={(e) => {
                e.stopPropagation();
                onOrganClick?.(meta.key);
              }}
              className={[
                "absolute grid h-11 w-11 place-items-center rounded-full",
                "border border-white/60 bg-surface/90 shadow-card backdrop-blur-sm",
                "transition-transform duration-150",
                isClickable
                  ? "cursor-pointer hover:scale-110 hover:border-day-primary/60 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-day-primary"
                  : "cursor-default",
              ].join(" ")}
              style={{
                left: `calc(50% + ${Math.cos(angle) * 47}% - 22px)`,
                top:  `calc(50% + ${Math.sin(angle) * 47}% - 22px)`,
              }}
              animate={reduceMotion ? undefined : { rotate: -360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            >
              <OrganIcon
                organ={meta.key}
                 color={empty ? undefined : TIER_VISUAL[organTier].hex}
                size={20}
                className={empty ? "opacity-40" : undefined}
              />
            </motion.button>
          );
        })}
      </motion.div>

      {/* Score ring */}
      <svg viewBox="0 0 200 200" className="absolute inset-[13%] -rotate-90">
        <circle
          cx="100" cy="100" r={RING_RADIUS}
          fill="none" stroke="var(--line)" strokeWidth="10"
          strokeDasharray={empty ? "3 8" : undefined}
        />
        {!empty && visual && (
          <motion.circle
            cx="100" cy="100" r={RING_RADIUS}
            fill="none" stroke={visual.hex} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            initial={{ strokeDashoffset: RING_CIRCUMFERENCE }}
            animate={{ strokeDashoffset: RING_CIRCUMFERENCE * (1 - visual.fill) }}
            transition={{ type: "spring", stiffness: 40, damping: 18, delay: 0.3 }}
          />
        )}
      </svg>

      {/* Center readout */}
      <div className="relative z-10 flex flex-col items-center gap-1 text-center">
        {empty ? (
          <>
            <Sparkles className="h-6 w-6 text-day-primary" />
            <span className="max-w-[9rem] text-xs leading-6 text-ink-muted">هنوز ارزیابی انجام نشده</span>
          </>
        ) : attentionCount > 0 ? (
          <>
            <motion.span
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.4 }}
              className="text-5xl font-black tabular-nums text-ink"
            >
              {toPersianDigits(attentionCount)}
            </motion.span>
            <span className="max-w-[9rem] text-xs leading-5 text-ink-subtle">مورد نیاز به پیگیری</span>
          </>
        ) : (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.4 }}
            className="max-w-[9rem] text-sm font-bold leading-6 text-teal-600 dark:text-teal-400"
          >
            همه موارد در وضعیت مطلوب
          </motion.span>
        )}
      </div>
    </div>
  );
}
