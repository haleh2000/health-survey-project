  // src/modules/survey/presentation/components/dashboard/HealthDashboard.tsx

  import { motion } from "framer-motion";
  import { CalendarCheck, ChevronDown, ChevronUp, History, ShieldPlus } from "lucide-react";
  import { useMemo, useState } from "react";

  import { JALALI_MONTH_NAMES, parseJalaliIso } from "@core/date/jalali";
  import { toPersianDigits } from "@core/text/digits";
  import type { RiskTier } from "@survey/domain/entities/risk-assessment.entity";
  import type { AssessmentRecord } from "@survey/infrastructure/storage/assessment-history.storage";

  import { BmiGauge, BmiRangeLegend } from "./BmiGauge";
  import { OrganRiskCard } from "./OrganRiskCard";
  import { RecommendationTiles } from "./RecommendationTiles";
  import {BodyMap} from "../../../../health-dashboard/components/BodyMap";
  import { StatusPanel } from "./StatusPanel";
  import type { OrganKey } from "./organ-meta";
  import { ORGAN_META, organPercent, scoreToTier } from "./organ-meta";

  interface Props {
    record: AssessmentRecord | null;
    historyCount: number;
  }



  const sectionSpring = { type: "spring", stiffness: 220, damping: 26 } as const;

  // ✅ تعداد کارت‌هایی که در حالت جمع‌شده نمایش داده می‌شوند
  const VISIBLE_ORGAN_COUNT = 3;

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

  export function HealthDashboard({ record, historyCount }: Props) {
    const assessment = record?.assessment ?? null;

    const [expandedOrgan, setExpandedOrgan] = useState<OrganKey | null>(null);
    const [showAllOrgans, setShowAllOrgans] = useState(false); // ✅ جدید

    const organRisksDisplay = assessment
      ? ORGAN_META.map((meta) => ({ meta, percent: organPercent(assessment.organRisks, meta) })).sort(
          (a, b) => b.percent - a.percent,
        )
      : ORGAN_META.map((meta) => ({ meta, percent: null as number | null }));

    // ✅ لیستی که واقعاً رندر می‌شود (۴ تای اول یا همه)
    const visibleOrganRisks = showAllOrgans
      ? organRisksDisplay
      : organRisksDisplay.slice(0, VISIBLE_ORGAN_COUNT);

    const hasMoreOrgans = organRisksDisplay.length > VISIBLE_ORGAN_COUNT;

    const organRisksForOrbit = useMemo<Partial<Record<OrganKey, { tier: RiskTier }>> | undefined>(() => {
      if (!assessment) return undefined;
      return Object.fromEntries(
        ORGAN_META.map((meta) => [
          meta.key,
          { tier: scoreToTier(organPercent(assessment.organRisks, meta)) },
        ]),
      ) as Partial<Record<OrganKey, { tier: RiskTier }>>;
    }, [assessment]);

    // ✅ باز/بسته کردن آکاردئون + باز کردن لیست در صورت نیاز + اسکرول نرم
    const handleSelectOrgan = (key: OrganKey) => {
      const indexInList = organRisksDisplay.findIndex((item) => item.meta.key === key);
      const isHidden = !showAllOrgans && indexInList >= VISIBLE_ORGAN_COUNT;
      if (isHidden) setShowAllOrgans(true);

      setExpandedOrgan((prev) => (prev === key ? null : key));

      const delay = isHidden ? 50 : 0;
      requestAnimationFrame(() => {
        setTimeout(() => {
          document
            .getElementById(`organ-card-${key}`)
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, delay);
      });
    };

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
                {assessment ? `سلام، ${assessment.fullName} 👋` : "خلاصه وضعیت سلامت شما"}
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
            <SectionLabel>تحلیل سلامت</SectionLabel>
            <div className="flex flex-col gap-3">
              {visibleOrganRisks.map(({ meta, percent }, index) => (
                <OrganRiskCard
                  key={meta.key}
                  meta={meta}
                  percent={percent}
                  delay={0.15 + index * 0.05}
                  expanded={expandedOrgan === meta.key}
                  onToggle={() => handleSelectOrgan(meta.key)}
                />
              ))}
            </div>

            {/* ✅ دکمه نمایش بیشتر / کمتر */}
            {hasMoreOrgans && (
              <button
                type="button"
                onClick={() => setShowAllOrgans((prev) => !prev)}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-2xl border border-day-primary/20 bg-day-primary/5 py-2.5 text-xs font-bold text-day-primary transition hover:bg-day-primary/10 cursor-pointer"
              >
                {showAllOrgans ? (
                  <>
                    نمایش کمتر
                    <ChevronUp className="h-3.5 w-3.5" />
                  </>
                ) : (
                  <>
                    نمایش {toPersianDigits(organRisksDisplay.length - VISIBLE_ORGAN_COUNT)} مورد دیگر
                    <ChevronDown className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            )}
          </div>

          <div className="order-first flex flex-col items-center justify-center gap-2 lg:order-none lg:self-start lg:sticky lg:top-24">
            <BodyMap
              organRisks={organRisksForOrbit}
              onOrganClick={handleSelectOrgan}
            />
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
