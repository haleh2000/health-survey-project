// src/modules/survey/presentation/components/dashboard/OrganRiskCard.tsx

import { motion } from "framer-motion";

import { AnimatedNumber } from "./AnimatedNumber";
import { severityOf, type OrganMeta } from "./organ-meta";

interface Props {
  meta: OrganMeta;
  /** 0–100, or null in the pre-assessment (empty) state. */
  percent: number | null;
  delay?: number;
}

const TRACK_GRADIENT =
  "linear-gradient(to left, #0d9488 0%, #14b8a6 30%, #eab308 60%, #f97316 82%, #dc2626 100%)";

/**
 * A featured risk card in the style of the reference design: icon bubble,
 * animated percentage, and a gradient track whose knob springs into place.
 */
export function OrganRiskCard({ meta, percent, delay = 0 }: Props) {
  const empty = percent === null;
  const severity = severityOf(percent ?? 0);
  const Icon = meta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 28, delay }}
      whileHover={{ y: -3 }}
      className="rounded-2xl border border-line bg-surface/80 p-4 shadow-card backdrop-blur-md sm:p-5"
    >
      <div className="flex items-center gap-3">
        <div
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${
            empty ? "bg-surface-muted text-ink-subtle" : "bg-day-primary/10 text-day-primary"
          }`}
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-ink">{meta.label}</p>
          <p className="truncate text-[11px] text-ink-subtle">{meta.driverLabel}</p>
        </div>

        <div className="text-left">
          {empty ? (
            <span className="text-xl font-black text-ink-subtle">—</span>
          ) : (
            <AnimatedNumber
              value={percent}
              suffix="٪"
              delay={delay + 0.15}
              className={`text-xl font-black tabular-nums ${severity.textClass}`}
            />
          )}
        </div>
      </div>

      <div className="mt-4">
        <div className="relative h-2 w-full rounded-full bg-surface-muted">
          <div
            className="absolute inset-0 rounded-full opacity-90"
            style={{ background: empty ? undefined : TRACK_GRADIENT }}
          />
          {/* Knob springs to the value; in RTL, "right" tracks the percentage. */}
          <motion.div
            initial={{ right: "0%" }}
            animate={{ right: `${empty ? 0 : percent}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20, delay: delay + 0.2 }}
            className="absolute top-1/2 h-4 w-4 -translate-y-1/2 translate-x-1/2 rounded-full border-2 border-white shadow-md"
            style={{ backgroundColor: empty ? "var(--line-strong)" : severity.hex }}
          />
        </div>

        <div className="mt-2.5 flex items-center justify-between">
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
              empty ? "bg-surface-muted text-ink-subtle" : severity.chipClass
            }`}
          >
            {empty ? "در انتظار ارزیابی" : `سطح ${severity.label}`}
          </span>
          <span className="text-[11px] text-ink-subtle">سطح ریسک</span>
        </div>
      </div>
    </motion.div>
  );
}
