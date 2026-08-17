// src/modules/survey/presentation/components/dashboard/OrganRiskCard.tsx

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

import { AnimatedNumber } from "./AnimatedNumber";
import { ORGAN_CONTENT, severityOf, type OrganMeta } from "./organ-meta";
import { OrganIcon } from "../../../../../design-system/illustrations/OrganIcon";
import { scoreToTier } from "./organ-meta";

interface Props {
  meta: OrganMeta;
  percent: number | null;
  delay?: number;
  expanded: boolean;
  onToggle: () => void;
}

const TRACK_GRADIENT =
  "linear-gradient(to left, #0d9488 0%, #14b8a6 30%, #eab308 60%, #f97316 82%, #dc2626 100%)";

export function OrganRiskCard({ meta, percent, delay = 0, expanded, onToggle }: Props) {
  const empty = percent === null;
  const severity = severityOf(percent ?? 0);
  const tier = scoreToTier(percent ?? 0);
  const content = ORGAN_CONTENT[meta.key];

  return (
    <motion.div
      id={`organ-card-${meta.key}`}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 28, delay }}
      className={`overflow-hidden rounded-2xl border bg-surface/80 shadow-card backdrop-blur-md transition-colors ${
        expanded ? "border-day-primary/50" : "border-line"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-center gap-3 p-4 text-right sm:p-5"
      >
        <div
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${
            empty ? "bg-surface-muted text-ink-subtle" : "bg-day-primary/10"
          }`}
        >
          {empty ? (
            // آیکون خنثی وقتی داده نیست — رنگ نداره، فقط opacity کم برای حالت خنثی
            <OrganIcon organ={meta.key} size={20} className="opacity-30" />
          ) : (
            <OrganIcon organ={meta.key} color={severity.hex} size={20} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-ink">{meta.label}</p>
          <p className="truncate text-[11px] text-ink-subtle">{meta.driverLabel}</p>
        </div>

        <div className="flex items-center gap-2 text-left">
          {!empty && (
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: severity.hex }}
              aria-hidden
            />
          )}
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-ink-subtle"
          >
            <ChevronDown className="h-4 w-4" />
          </motion.span>
        </div>
      </button>

      <div className="px-4 pb-4 sm:px-5 sm:pb-5">
        <div className="relative h-2 w-full rounded-full bg-surface-muted">
          <div
            className="absolute inset-0 rounded-full opacity-90"
            style={{ background: empty ? undefined : TRACK_GRADIENT }}
          />
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
            {empty ? "در انتظار ارزیابی" : ` ${severity.label}`}
          </span>
          <span className="text-[11px] text-ink-subtle">وضعیت سلامت</span>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && !empty && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="overflow-hidden border-t border-line"
          >
            <div className="space-y-4 p-4 sm:p-5">
              <p className="text-xs leading-relaxed text-ink-subtle">{content.description}</p>

              <div>
                <h4 className="mb-2 text-xs font-bold text-ink">توصیه‌های سلامت</h4>
                <ul className="space-y-1.5">
                  {content.tips.map((tip) => (
                    <li key={tip} className="flex items-start gap-2">
                      <span
                        className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: severity.hex }}
                        aria-hidden
                      />
                      <span className="text-xs leading-relaxed text-ink-subtle">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950/30">
                <h4 className="mb-1 text-xs font-bold text-red-700 dark:text-red-400">
                  علائم هشداردهنده
                </h4>
                <p className="text-xs leading-relaxed text-red-600 dark:text-red-400/80">
                  {content.warningSign}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
