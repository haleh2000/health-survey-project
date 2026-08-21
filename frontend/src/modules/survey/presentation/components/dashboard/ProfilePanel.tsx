// src/modules/survey/presentation/components/dashboard/ProfilePanel.tsx
// ستون «پروفایل» داشبورد: اطلاعات پایه (سن/قد/وزن/BMI)،
// وضعیت‌ها دوتایی در هر ردیف (مرتب بر اساس شدت)، جمع‌بندی موارد نیازمند
// پیگیری، و دکمهٔ «مشاهده ارزیابی‌های من».

import { motion } from "framer-motion";
import { AlertTriangle, Cake, Check, History, Ruler, Scale, User, Weight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { toPersianDigits } from "@core/text/digits";
import type { RiskAssessment } from "@survey/domain/entities/risk-assessment.entity";
import type { AssessmentRecord } from "@survey/infrastructure/storage/assessment-history.storage";

import { AssessmentHistoryModal } from "./AssessmentHistoryModal";
import { rankStatuses } from "./profile-status";

interface Props {
  readonly assessment: RiskAssessment | null;
  readonly record: AssessmentRecord | null;
  readonly history: readonly AssessmentRecord[];
  readonly baseDelay?: number;
}

const spring = { type: "spring", stiffness: 260, damping: 28 } as const;

export function ProfilePanel({ assessment, record, history, baseDelay = 0 }: Props) {
  const [historyOpen, setHistoryOpen] = useState(false);

  const flags = assessment?.flags ?? null;

  /** وضعیت‌ها به ترتیب شدت (تعداد پرچم فعال) از زیاد به کم */
  const rankedStatuses = useMemo(() => rankStatuses(flags), [flags]);

  const flaggedCount = rankedStatuses.filter((s) => s.fired > 0).length;

  const basics: readonly { label: string; value: string; icon: LucideIcon }[] = [
    {
      label: "سن",
      value: assessment ? `${toPersianDigits(assessment.ageYears)} سال` : "—",
      icon: Cake,
    },
    {
      label: "قد",
      value: record?.heightCm ? `${toPersianDigits(record.heightCm)} سانتی‌متر` : "—",
      icon: Ruler,
    },
    {
      label: "وزن",
      value: record?.weightKg ? `${toPersianDigits(record.weightKg)} کیلوگرم` : "—",
      icon: Weight,
    },
    {
      label: "BMI",
      value: assessment?.bmi != null ? toPersianDigits(assessment.bmi) : "—",
      icon: Scale,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* سربرگ پروفایل */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: baseDelay }}
        className="rounded-2xl border border-line bg-surface/80 p-4 shadow-card backdrop-blur-md"
      >
        <div className="mb-3 flex items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-day-primary to-teal-600 text-white">
            <User className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-ink">
              {assessment?.fullName ?? "پروفایل سلامت"}
            </p>
            <p className="text-[11px] text-ink-subtle">
              {assessment ? assessment.levelLabel : "پس از ارزیابی تکمیل می‌شود"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {basics.map((b) => (
            <div
              key={b.label}
              className="flex items-center gap-2 rounded-xl bg-surface-muted/70 px-2.5 py-2"
            >
              <b.icon className="h-3.5 w-3.5 shrink-0 text-day-primary" />
              <div className="min-w-0">
                <p className="text-[10px] text-ink-subtle">{b.label}</p>
                <p className="truncate text-[11px] font-bold text-ink tabular-nums">{b.value}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* وضعیت‌ها — دوتایی در هر ردیف، مرتب از پرریسک به مطلوب */}
      <div className="grid grid-cols-2 gap-2.5">
        {rankedStatuses.map(({ item, fired }, index) => {
          const empty = flags === null;
          const flagged = fired > 0;
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: baseDelay + 0.08 + index * 0.05 }}
              className="flex flex-col gap-1.5 rounded-2xl border border-line bg-surface/80 p-3 shadow-card backdrop-blur-md"
            >
              <div className="flex items-center justify-between gap-1">
                <div
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                    empty
                      ? "bg-surface-muted text-ink-subtle"
                      : flagged
                        ? "bg-amber-500/10 text-amber-600"
                        : "bg-emerald-500/10 text-emerald-600"
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </div>
                {!empty && (
                  <span
                    className={`grid h-5 w-5 place-items-center rounded-full text-white ${
                      flagged ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                  >
                    {flagged ? (
                      <AlertTriangle className="h-3 w-3" />
                    ) : (
                      <Check className="h-3 w-3" />
                    )}
                  </span>
                )}
              </div>
              <p className="truncate text-[12px] font-bold text-ink">{item.title}</p>
              <p
                className={`truncate text-[10px] font-medium ${
                  empty ? "text-ink-subtle" : flagged ? "text-amber-600" : "text-emerald-600"
                }`}
              >
                {empty ? "پس از ارزیابی" : flagged ? item.badLabel : item.goodLabel}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* جمع‌بندی */}
      {flags && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: baseDelay + 0.4 }}
          className={`rounded-xl px-3 py-2.5 text-center text-[11px] font-bold ${
            flaggedCount > 0
              ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
              : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          }`}
        >
          {flaggedCount > 0
            ? `${toPersianDigits(flaggedCount)} مورد نیاز به پیگیری دارد`
            : "همهٔ وضعیت‌ها در محدودهٔ مطلوب است 🎉"}
        </motion.p>
      )}

      {/* مشاهده ارزیابی‌های قبلی */}
      <motion.button
        type="button"
        onClick={() => setHistoryOpen(true)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: baseDelay + 0.45 }}
        className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border
                   border-day-primary/30 bg-day-primary/5 py-3 text-xs font-black text-day-primary
                   transition hover:bg-day-primary/10"
      >
        <History className="h-4 w-4" />
        مشاهده ارزیابی‌های من
      </motion.button>

      <AssessmentHistoryModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={history}
      />
    </div>
  );
}
