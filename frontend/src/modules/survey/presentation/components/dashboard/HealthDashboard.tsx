  // src/modules/survey/presentation/components/dashboard/HealthDashboard.tsx

  import { motion } from "framer-motion";
  import { CalendarCheck, History, ShieldPlus } from "lucide-react";
  import { useMemo, useRef, useState } from "react";

  import { JALALI_MONTH_NAMES, parseJalaliIso } from "@core/date/jalali";
  import { toPersianDigits } from "@core/text/digits";
  import type { AssessmentRecord } from "@survey/infrastructure/storage/assessment-history.storage";

  import { BmiGauge, BmiRangeLegend } from "./BmiGauge";
  import { BmiComparisonChart } from "./BmiComparisonChart";
  import { RecommendationTiles } from "./RecommendationTiles";
  import { AnatomyFigure } from "../../../../health-dashboard/components/AnatomyFigure";
  import { OrganConnectors, type ConnectorTarget } from "../../../../health-dashboard/components/OrganConnectors";
  import { OrganAdviceList } from "./OrganAdviceList";
  import { ProfilePanel } from "./ProfilePanel";
  import type { OrganKey } from "./organ-meta";
  import { ORGAN_META, organPercent, severityOf } from "./organ-meta";

  interface Props {
    record: AssessmentRecord | null;
    history: readonly AssessmentRecord[];
  }



  const sectionSpring = { type: "spring", stiffness: 220, damping: 26 } as const;

  /**
   * ✅ فقط ارگان‌هایی روی بدن نشان داده می‌شوند که واقعاً به وضعیت کاربر مربوط‌اند:
   *    هر ارگان با ریسک «قابل بهبود» به بالا. اگر کمتر از ۳ مورد بود،
   *    ۳ ارگان با بیشترین ریسک نمایش داده می‌شوند تا بدن خالی نماند.
   */
  const RELEVANCE_THRESHOLD = 12;
  const MIN_VISIBLE_ORGANS = 3;

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

  export function HealthDashboard({ record, history }: Props) {
    const assessment = record?.assessment ?? null;
    const historyCount = history.length;

    /** ناحیه‌ای که فلش‌های «اندام → کارت» رویش کشیده می‌شوند */
    const connectorHostRef = useRef<HTMLDivElement | null>(null);

    /** کارتِ بازِ آکاردئون؛ کلیک روی ارگان بدن هم همین را باز می‌کند */
    const [expandedOrgan, setExpandedOrgan] = useState<OrganKey | null>(null);
    const [showAllCards, setShowAllCards] = useState(false);

    /** همهٔ ارگان‌ها مرتب از پرریسک به مطلوب — منبع کارت‌های توصیه */
    const rankedOrgans = useMemo(() => {
      if (!assessment) return [];
      return ORGAN_META
        .map((meta) => ({ key: meta.key, percent: organPercent(assessment.organRisks, meta) }))
        .sort((a, b) => b.percent - a.percent);
    }, [assessment]);

    /** درصد ریسک ارگان‌های مرتبط — کلید موجود = ارگان فعال روی بدن */
    const organPercents = useMemo<Partial<Record<OrganKey, number>>>(() => {
      const relevant = rankedOrgans.filter((item) => item.percent >= RELEVANCE_THRESHOLD);
      const picked = relevant.length >= MIN_VISIBLE_ORGANS ? relevant : rankedOrgans.slice(0, MIN_VISIBLE_ORGANS);
      return Object.fromEntries(picked.map((item) => [item.key, item.percent]));
    }, [rankedOrgans]);

    /**
     * فلش‌ها فقط برای اندام‌هایی کشیده می‌شوند که هم روی بدن فعال‌اند و هم
     * کارتشان همین حالا در لیست دیده می‌شود.
     */
    const connectorTargets = useMemo<ConnectorTarget[]>(() => {
      const visible = showAllCards ? rankedOrgans : rankedOrgans.slice(0, 3);
      return visible
        .filter((item) => organPercents[item.key] != null)
        .map((item) => ({ key: item.key, color: severityOf(item.percent).hex }));
    }, [rankedOrgans, organPercents, showAllCards]);

    /** کلیک روی ارگان بدن: کارتش را باز کن و به آن اسکرول کن */
    const handleSelectOrgan = (key: OrganKey) => {
      const index = rankedOrgans.findIndex((item) => item.key === key);
      if (index >= 3) setShowAllCards(true);
      setExpandedOrgan((current) => (current === key ? null : key));
      requestAnimationFrame(() => {
        document
          .getElementById(`organ-card-${key}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
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

        {/* ✅ مدل دوبعدی آناتومی + کارت‌های توصیه + پروفایل */}
        <section className="grid grid-cols-1 gap-5 rounded-3xl border border-white/50 bg-surface/70 p-5 shadow-card backdrop-blur-xl sm:p-6 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)]">
          <div>
            <SectionLabel>نقشهٔ سلامت اندام‌ها</SectionLabel>
            <p className="mb-3 text-[11px] text-ink-subtle">
              {assessment
                ? "کارت‌ها به ترتیب از «نیاز به پیگیری» تا «وضعیت مطلوب» مرتب شده‌اند. برای دیدن توصیه‌های هر اندام، کارت آن را باز کنید."
                : "پس از اولین ارزیابی، اندام‌های مرتبط با وضعیت شما اینجا فعال می‌شوند."}
            </p>

            <div
              ref={connectorHostRef}
              className="relative grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
            >
              {/* فلش‌های اتصال هر اندام به کارت خودش — پشتِ کارت‌ها رسم می‌شوند */}
              {assessment && (
                <OrganConnectors
                  hostRef={connectorHostRef}
                  targets={connectorTargets}
                  highlightedOrgan={expandedOrgan}
                  layoutSignal={`${showAllCards}-${connectorTargets.length}`}
                />
              )}

              {/* بدن — هنگام اسکرولِ کارت‌ها ثابت می‌ماند */}
              <div className="relative z-10 md:sticky md:top-4 md:self-start">
                <AnatomyFigure
                  organPercents={organPercents}
                  highlightedOrgan={expandedOrgan}
                  onSelectOrgan={handleSelectOrgan}
                />
              </div>

              {/* کارت‌های توصیه — روی لایهٔ فلش‌ها می‌نشینند */}
              <div className="relative z-10">
                {assessment ? (
                  <OrganAdviceList
                    ranked={rankedOrgans}
                    visibleCount={3}
                    expandedKey={expandedOrgan}
                    onToggle={(key) =>
                      setExpandedOrgan((current) => (current === key ? null : key))
                    }
                    showAll={showAllCards}
                    onShowMore={() => setShowAllCards((v) => !v)}
                  />
                ) : (
                  <p className="rounded-2xl border border-dashed border-line p-6 text-center text-[11px] text-ink-subtle">
                    کارت‌های توصیه پس از اولین ارزیابی ساخته می‌شوند.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <SectionLabel>پروفایل من</SectionLabel>
            <ProfilePanel
              assessment={assessment}
              record={record}
              history={history}
              baseDelay={0.2}
            />
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
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
            <div className="flex flex-col gap-4">
              <BmiGauge bmi={assessment?.bmi ?? null} />
              <BmiRangeLegend bmi={assessment?.bmi ?? null} />
            </div>

            <div>
              <h4 className="mb-1 text-xs font-black text-day-primary">مقایسه با محدوده نرمال</h4>
              <p className="mb-3 text-[11px] text-ink-subtle">
                آنچه باید باشد در برابر آنچه اکنون هست — و اینکه چقدر بالاتر یا پایین‌تر هستید.
              </p>
              <BmiComparisonChart
                bmi={assessment?.bmi ?? null}
                heightCm={record?.heightCm ?? null}
                weightKg={record?.weightKg ?? null}
              />
            </div>
          </div>
        </motion.section>

        {/* Daily recommendations. */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <span className="text-sm font-black text-ink">پیشنهادهای روزانه</span>
            <span className="text-[11px] text-ink-subtle">قدم‌های کوچک، اثر بزرگ</span>
          </div>
          <RecommendationTiles baseDelay={0.35} tier={assessment?.tier ?? null} />

        </section>
      </div>
    );
  }
