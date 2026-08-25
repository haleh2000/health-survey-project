// src/modules/survey/presentation/components/dashboard/ProfilePanel.tsx
// ستون «پروفایل» داشبورد: اطلاعات پایه (سن/قد/وزن/BMI)،
// وضعیت‌ها دوتایی در هر ردیف (مرتب بر اساس شدت)، و جمع‌بندی موارد نیازمند پیگیری.

import { motion } from "framer-motion";
import {
  AlertTriangle,
  Cake,
  Check,
  Ruler,
  Scale,
  User,
  Weight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo } from "react";

import { toPersianDigits } from "@core/text/digits";
import type { RiskAssessment } from "@survey/domain/entities/risk-assessment.entity";
import type { AssessmentRecord } from "@survey/infrastructure/storage/assessment-history.storage";

import { rankStatuses } from "./profile-status";

interface Props {
  readonly assessment: RiskAssessment | null;
  readonly record: AssessmentRecord | null;
  readonly baseDelay?: number;
}

const spring = {
  type: "spring",
  stiffness: 260,
  damping: 28,
} as const;

export function ProfilePanel({
  assessment,
  record,
  baseDelay = 0,
}: Props) {
  const flags = assessment?.flags ?? null;

  /** وضعیت‌ها به ترتیب شدت (تعداد پرچم فعال) از زیاد به کم */
  const rankedStatuses = useMemo(
    () => rankStatuses(flags),
    [flags],
  );

  const flaggedCount = rankedStatuses.filter(
    (s) => s.fired > 0,
  ).length;

  const basics: readonly {
    label: string;
    value: string;
    icon: LucideIcon;
  }[] = [
    {
      label: "سن",
      value: assessment
        ? `${toPersianDigits(assessment.ageYears)} سال`
        : "—",
      icon: Cake,
    },
    {
      label: "قد",
      value: record?.heightCm
        ? `${toPersianDigits(record.heightCm)} سانتی‌متر`
        : "—",
      icon: Ruler,
    },
    {
      label: "وزن",
      value: record?.weightKg
        ? `${toPersianDigits(record.weightKg)} کیلوگرم`
        : "—",
      icon: Weight,
    },
    {
      label: "BMI",
      value:
        assessment?.bmi != null
          ? toPersianDigits(assessment.bmi)
          : "—",
      icon: Scale,
    },
  ];

  return (
    <div className="flex w-full min-w-0 flex-col gap-3 sm:gap-4">
      {/* سربرگ پروفایل */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: baseDelay }}
        className="rounded-2xl border border-line bg-surface/80 p-3 shadow-card backdrop-blur-md sm:p-4"
      >
        <div className="mb-2.5 flex items-center gap-2.5 sm:mb-3 sm:gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-day-primary to-teal-600 text-white sm:h-11 sm:w-11">
            <User className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-[13px] font-black text-ink sm:text-sm">
              {assessment?.fullName ?? "پروفایل سلامت"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
          {basics.map((b) => (
            <div
              key={b.label}
              className="flex min-w-0 items-center gap-2 rounded-xl bg-surface-muted/70 px-2 py-1.5 sm:px-2.5 sm:py-2"
            >
              <b.icon className="h-4 w-4 shrink-0 text-day-primary sm:h-5 sm:w-5" />

              <div className="min-w-0">
                <p className="text-[12px] text-ink-subtle sm:text-[13px] lg:text-[14px]">
                  {b.label}
                </p>

                <p className="truncate text-[13px] font-bold text-ink tabular-nums sm:text-[15px]">
                  {b.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* وضعیت‌ها — یک‌ستونه در موبایل باریک، دوتایی از عرض‌های بزرگ‌تر */}
      <div className="grid grid-cols-1 gap-2 min-[400px]:grid-cols-2 sm:gap-2.5">
        {rankedStatuses.map(({ item, fired }, index) => {
          const empty = flags === null;
          const flagged = fired > 0;
          const Icon = item.icon;

          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                ...spring,
                delay: baseDelay + 0.08 + index * 0.05,
              }}
              className="flex min-w-0 flex-col gap-1 rounded-2xl border border-line bg-surface/80 p-2.5 shadow-card backdrop-blur-md sm:gap-1.5 sm:p-3"
            >
              <div className="flex items-center justify-between gap-1">
                <div
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full sm:h-10 sm:w-10 ${
                    empty
                      ? "bg-surface-muted text-ink-subtle"
                      : flagged
                        ? "bg-amber-500/10 text-amber-600"
                        : "bg-emerald-500/10 text-emerald-600"
                  }`}
                >
                  <Icon
                    className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                    strokeWidth={2}
                  />
                </div>

                {!empty && (
                  <span
                    className={`grid h-4.5 w-4.5 shrink-0 place-items-center rounded-full text-white sm:h-5 sm:w-5 ${
                      flagged
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                  >
                    {flagged ? (
                      <AlertTriangle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    ) : (
                      <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    )}
                  </span>
                )}
              </div>

              <p className="line-clamp-2 text-[13px] font-bold leading-snug text-ink sm:text-[15px] lg:text-[16px]">
                {item.title}
              </p>

              <p
                className={`line-clamp-2 text-[12px] font-medium leading-snug sm:text-[13px] lg:text-[14px] ${
                  empty
                    ? "text-ink-subtle"
                    : flagged
                      ? "text-amber-600"
                      : "text-emerald-600"
                }`}
              >
                {empty
                  ? "پس از ارزیابی"
                  : flagged
                    ? item.badLabel
                    : item.goodLabel}
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
          className={`rounded-xl px-2.5 py-2 text-center text-[11px] font-bold leading-relaxed sm:px-3 sm:py-2.5 sm:text-xs ${
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
    </div>
  );
}
