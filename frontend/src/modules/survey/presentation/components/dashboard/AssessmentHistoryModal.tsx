// src/modules/survey/presentation/components/dashboard/AssessmentHistoryModal.tsx
// مودال «ارزیابی‌های من»: فهرست ارزیابی‌های ذخیره‌شده روی دستگاه.
// فعلاً فقط فرانت است (localStorage)؛ بعداً به دیتابیس وصل می‌شود.

import { AnimatePresence, motion } from "framer-motion";
import { CalendarCheck, Sparkles, X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

import { JALALI_MONTH_NAMES, parseJalaliIso } from "@core/date/jalali";
import { toPersianDigits } from "@core/text/digits";
import type { AssessmentRecord } from "@survey/infrastructure/storage/assessment-history.storage";

interface Props {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly history: readonly AssessmentRecord[];
}

const readableJalali = (iso: string): string => {
  const parts = parseJalaliIso(iso);
  if (!parts) return iso;
  return `${toPersianDigits(parts.day)} ${JALALI_MONTH_NAMES[parts.month - 1]} ${toPersianDigits(parts.year)}`;
};

export function AssessmentHistoryModal({ open, onClose, history }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="ارزیابی‌های من"
        >
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[80vh] w-full max-w-md overflow-hidden rounded-3xl border border-white/40
                       bg-surface shadow-raised"
            dir="rtl"
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h3 className="text-sm font-black text-ink">ارزیابی‌های من</h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="بستن"
                className="cursor-pointer rounded-lg p-1.5 text-ink-subtle transition hover:bg-surface-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[calc(80vh-60px)] overflow-y-auto p-5">
            {history.length === 0 ? (
              /* حالت اولین بار */
              <div className="flex flex-col items-center gap-4 py-8 text-center
                  sm:flex-row sm:items-center sm:gap-5 sm:py-6 sm:text-right">
                <img
                  src="/illustrations/first-assessment.png"
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className="h-28 w-28 shrink-0 object-contain sm:h-32 sm:w-32"
                />

                <div className="flex flex-col items-center gap-3 sm:items-start">
                  {/* <span className="grid h-14 w-14 place-items-center rounded-full bg-day-primary/10 text-day-primary sm:hidden">
                    <Sparkles className="h-7 w-7" />
                  </span> */}
                  <p className="text-sm font-black text-ink">این اولین ارزیابی شماست 🌱</p>
                  <p className="max-w-[260px] text-[11px] leading-6 text-ink-subtle">
                    هنوز ارزیابی ذخیره‌شده‌ای ندارید. بعد از هر ارزیابی، نتیجه همین‌جا
                    ذخیره می‌شود تا بتوانید روند سلامت خود را در طول زمان دنبال کنید.
                  </p>
                </div>
              </div>
            ) : (

                <ol className="flex flex-col gap-3">
                  {history.map((record, index) => {
                    const a = record.assessment;
                    return (
                      <li
                        key={record.completedAt}
                        className="rounded-2xl border border-line bg-surface/80 p-4"
                      >
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-ink">
                            <CalendarCheck className="h-3.5 w-3.5 text-day-primary" />
                            {readableJalali(record.completedOnJalali)}
                          </span>
                          {index === 0 && (
                            <span className="rounded-full bg-day-primary/10 px-2 py-0.5 text-[10px] font-bold text-day-primary">
                              آخرین ارزیابی
                            </span>
                          )}
                        </div>
                        <p className="mb-1 text-[11px] text-ink-muted">{a.levelLabel}</p>
                        <div className="flex flex-wrap items-center gap-2 text-[10px] text-ink-subtle">
                          <span className="rounded-full bg-surface-muted px-2 py-0.5 tabular-nums">
                            نمره ریسک: {toPersianDigits(a.score)}
                          </span>
                          {a.bmi != null && (
                            <span className="rounded-full bg-surface-muted px-2 py-0.5 tabular-nums">
                              BMI: {toPersianDigits(a.bmi)}
                            </span>
                          )}
                          <span className="rounded-full bg-surface-muted px-2 py-0.5 tabular-nums">
                            سن: {toPersianDigits(a.ageYears)}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
