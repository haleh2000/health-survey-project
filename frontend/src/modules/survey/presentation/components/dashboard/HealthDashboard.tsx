// src/modules/survey/presentation/components/dashboard/HealthDashboard.tsx

import { motion } from "framer-motion";
import { CalendarCheck, History, ShieldPlus } from "lucide-react";

import { JALALI_MONTH_NAMES, parseJalaliIso } from "@core/date/jalali";
import { toPersianDigits } from "@core/text/digits";
import type { AssessmentRecord } from "@survey/infrastructure/storage/assessment-history.storage";

import { BmiGauge, BmiRangeLegend } from "./BmiGauge";
import { ORGAN_META, organPercent } from "./organ-meta";
import { OrganRiskCard } from "./OrganRiskCard";
import { RecommendationTiles } from "./RecommendationTiles";
import { ScoreOrbit } from "./ScoreOrbit";
import { StatusPanel } from "./StatusPanel";

interface Props {
  record: AssessmentRecord | null;
  historyCount: number;
}

const FEATURED_CARDS = 4;

const sectionSpring = { type: "spring", stiffness: 220, damping: 26 } as const;

const readableJalali = (iso: string): string => {
  const parts = parseJalaliIso(iso);
  if (!parts) return iso;
  return `${toPersianDigits(parts.day)} ${JALALI_MONTH_NAMES[parts.month - 1]} ${toPersianDigits(parts.year)}`;
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 text-xs font-black tracking-wide text-day-primary">{children}</h3>
  );
}

/**
 * The personal health summary — the web version of the reference dashboard.
 * With no completed assessment every module renders a zeroed, waiting state;
 * after one, it fills with that person's risks, flags and BMI.
 */
export function HealthDashboard({ record, historyCount }: Props) {
  const assessment = record?.assessment ?? null;

  // Featured cards: the person's highest risks first, mirroring the reference.
  const featured = assessment
    ? ORGAN_META.map((meta) => ({ meta, percent: organPercent(assessment.organRisks, meta) }))
        .sort((a, b) => b.percent - a.percent)
        .slice(0, FEATURED_CARDS)
    : ORGAN_META.slice(0, FEATURED_CARDS).map((meta) => ({ meta, percent: null as number | null }));

  return (
    <div className="flex flex-col gap-5">
      {/* Header card. */}
      <motion.section
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={sectionSpring}
        className="flex flex-col gap-4 rounded-3xl border border-white/50 bg-surface/70 p-5 shadow-card backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:p-6"
      >
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-day-primary to-teal-600 text-white shadow-raised">
            <ShieldPlus className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-lg font-black text-ink sm:text-xl">
              {assessment ? `سلام، ${assessment.fullName} 👋` : "خلاصه سلامت و ریسک شما"}
            </h2>
            <p className="text-xs leading-6 text-ink-muted sm:text-sm">
              {assessment
                ? "این تصویر سلامت شما بر اساس آخرین ارزیابی است."
                : "بینش سلامت شما بر اساس عادت‌ها و سوابق پزشکی — بعد از اولین ارزیابی فعال می‌شود."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-day-primary/10 px-3 py-1.5 text-xs font-bold text-day-primary">
            <History className="h-3.5 w-3.5" />
            {toPersianDigits(historyCount)} ارزیابی انجام شده
          </span>
          {record && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1.5 text-xs font-semibold text-ink-muted">
              <CalendarCheck className="h-3.5 w-3.5" />
              آخرین: {readableJalali(record.completedOnJalali)}
            </span>
          )}
        </div>
      </motion.section>

      {/* Main grid: risks / orbit / status. */}
      <section className="grid grid-cols-1 gap-5 rounded-3xl border border-white/50 bg-surface/70 p-5 shadow-card backdrop-blur-xl sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,1fr)]">
        <div>
          <SectionLabel>تحلیل ریسک</SectionLabel>
          <div className="flex flex-col gap-3">
            {featured.map(({ meta, percent }, index) => (
              <OrganRiskCard key={meta.key} meta={meta} percent={percent} delay={0.15 + index * 0.09} />
            ))}
          </div>
        </div>

        <div className="order-first flex flex-col items-center justify-center gap-2 lg:order-none">
          <ScoreOrbit
            score={assessment?.score ?? null}
            tier={assessment?.tier ?? null}
            levelLabel={assessment?.levelLabel ?? null}
          />
          {assessment && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="max-w-[18rem] text-center text-[11px] leading-6 text-ink-subtle"
            >
              سن: {toPersianDigits(assessment.ageYears)} سال • کد ملی:{" "}
              {toPersianDigits(assessment.nationalId)}
            </motion.p>
          )}
        </div>

        <div>
          <SectionLabel>سوابق و وضعیت</SectionLabel>
          <StatusPanel flags={assessment?.flags ?? null} baseDelay={0.2} />
        </div>
      </section>

      {/* BMI visualizer. */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...sectionSpring, delay: 0.25 }}
        className="rounded-3xl border border-white/50 bg-surface/70 p-5 shadow-card backdrop-blur-xl sm:p-6"
      >
        <div className="mb-4 flex items-baseline gap-2">
          <h3 className="text-sm font-black text-ink">شاخص توده بدنی (BMI)</h3>
          <span className="text-[11px] text-ink-subtle">
            {assessment?.bmi != null ? "وضعیت بدن شما در یک نگاه" : "پس از ارزیابی محاسبه می‌شود"}
          </span>
        </div>
        <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <BmiGauge bmi={assessment?.bmi ?? null} />
          <BmiRangeLegend bmi={assessment?.bmi ?? null} />
        </div>
      </motion.section>

      {/* Daily recommendations. */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <span className="text-sm font-black text-ink">پیشنهادهای روزانه</span>
          <span className="text-[11px] text-ink-subtle">قدم‌های کوچک، اثر بزرگ</span>
        </div>
        <RecommendationTiles baseDelay={0.35} />
      </section>
    </div>
  );
}
