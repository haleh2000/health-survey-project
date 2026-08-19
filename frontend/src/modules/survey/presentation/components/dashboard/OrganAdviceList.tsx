// src/modules/survey/presentation/components/dashboard/OrganAdviceList.tsx
// کارت‌های توصیهٔ اندام‌ها: مرتب از «نیاز به پیگیری» تا «مطلوب».
// سه کارت اول همیشه دیده می‌شوند؛ بقیه با «نمایش بیشتر» باز می‌شوند.
// هر کارت آکاردئون است: بسته = نوار پیشرفت + لیبل + توضیح کوتاه؛
// باز = توصیه‌ها و علائم هشدار.

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

import { toPersianDigits } from "@core/text/digits";

import type { OrganKey } from "./organ-meta";
import { ORGAN_CONTENT, ORGAN_META, severityOf } from "./organ-meta";

export interface RankedOrgan {
  readonly key: OrganKey;
  readonly percent: number;
}

interface Props {
  readonly ranked: readonly RankedOrgan[];
  readonly visibleCount: number;
  readonly expandedKey: OrganKey | null;
  readonly onToggle: (key: OrganKey) => void;
  readonly onShowMore: () => void;
  readonly showAll: boolean;
}

const spring = { type: "spring", stiffness: 260, damping: 28 } as const;

export function OrganAdviceList({
  ranked,
  visibleCount,
  expandedKey,
  onToggle,
  onShowMore,
  showAll,
}: Props) {
  const visible = showAll ? ranked : ranked.slice(0, visibleCount);
  const hiddenCount = ranked.length - visibleCount;

  return (
    <div className="flex flex-col gap-3">
      {visible.map((item, index) => {
        const meta = ORGAN_META.find((m) => m.key === item.key);
        const content = ORGAN_CONTENT[item.key];
        const severity = severityOf(item.percent);
        const isOpen = expandedKey === item.key;

        return (
          <motion.div
            key={item.key}
            id={`organ-card-${item.key}`}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: Math.min(index, 3) * 0.06 }}
            className="overflow-hidden rounded-2xl border bg-surface/90 shadow-card backdrop-blur-md"
            style={{ borderColor: isOpen ? `${severity.hex}66` : "var(--color-line, #e5e7eb)" }}
          >
            {/* سرکارت — همیشه دیده می‌شود و کلیک، آکاردئون را باز/بسته می‌کند */}
            <button
              type="button"
              onClick={() => onToggle(item.key)}
              aria-expanded={isOpen}
              className="flex w-full cursor-pointer flex-col gap-2 p-4 text-right"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: severity.hex }}
                    aria-hidden
                  />
                  <span className="text-sm font-black text-ink">{meta?.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${severity.chipClass}`}
                  >
                    {severity.label}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={spring}
                    className="grid h-6 w-6 place-items-center rounded-full bg-surface-muted text-ink-subtle"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </motion.span>
                </div>
              </div>

              {/* نوار پیشرفت ریسک */}
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: severity.hex }}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percent}%` }}
                    transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.2 }}
                  />
                </div>
                <span className="text-[11px] font-bold tabular-nums" style={{ color: severity.hex }}>
                  {toPersianDigits(item.percent)}٪
                </span>
              </div>

              {/* توضیح کوتاه ۲-۳ خطی */}
              <p className="text-[11px] leading-relaxed text-ink-subtle line-clamp-3">
                {content.description}
              </p>
            </button>

            {/* بدنهٔ آکاردئون */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="body"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 240, damping: 30 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-line px-4 pb-4 pt-3">
                    <h5 className="mb-1.5 text-[11px] font-bold text-ink">توصیه‌های سلامت</h5>
                    <ul className="space-y-1.5">
                      {content.tips.map((tip) => (
                        <li key={tip} className="flex items-start gap-1.5">
                          <span
                            className="mt-1.5 h-1 w-1 shrink-0 rounded-full"
                            style={{ backgroundColor: severity.hex }}
                            aria-hidden
                          />
                          <span className="text-[11px] leading-relaxed text-ink-subtle">{tip}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2.5 dark:border-red-900 dark:bg-red-950/30">
                      <h5 className="mb-0.5 text-[11px] font-bold text-red-700 dark:text-red-400">
                        علائم هشداردهنده
                      </h5>
                      <p className="text-[11px] leading-relaxed text-red-600 dark:text-red-400/80">
                        {content.warningSign}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {hiddenCount > 0 && (
        <motion.button
          type="button"
          onClick={onShowMore}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mt-1 cursor-pointer rounded-2xl border border-dashed border-day-primary/40
                     bg-day-primary/5 py-2.5 text-xs font-bold text-day-primary transition
                     hover:bg-day-primary/10"
        >
          {showAll
            ? "نمایش کمتر"
            : `نمایش ${toPersianDigits(hiddenCount)} مورد دیگر`}
        </motion.button>
      )}
    </div>
  );
}
