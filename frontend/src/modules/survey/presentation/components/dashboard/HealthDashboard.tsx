  // src/modules/survey/presentation/components/dashboard/HealthDashboard.tsx

  import { motion } from "framer-motion";
  import { CalendarCheck, History, ShieldPlus } from "lucide-react";
  import { useEffect, useMemo, useRef, useState } from "react";

  import { JALALI_MONTH_NAMES, parseJalaliIso } from "@core/date/jalali";
  import { toPersianDigits } from "@core/text/digits";
  import type { AssessmentRecord } from "@survey/infrastructure/storage/assessment-history.storage";

  import { BmiGauge, BmiRangeLegend } from "./BmiGauge";
  import { DashboardActions } from "./DashboardActions";
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

  /** آیا چیدمان تک‌ستونه است؟ (موبایل — کارت‌ها دو طرف بدن جا نمی‌شوند) */
  function useIsCompact(): boolean {
    const query = "(max-width: 767px)";
    const [compact, setCompact] = useState(
      () => typeof window !== "undefined" && window.matchMedia(query).matches,
    );
    useEffect(() => {
      const mq = window.matchMedia(query);
      const onChange = (event: MediaQueryListEvent) => setCompact(event.matches);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    }, []);
    return compact;
  }

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

    const compact = useIsCompact();

    /** ناحیه‌ای که فلش‌های «اندام → کارت» رویش کشیده می‌شوند */
    const connectorHostRef = useRef<HTMLDivElement | null>(null);

    /** ناحیه‌ای که در PDF خروجی گرفته می‌شود — همان سکشن‌های داشبورد */
    const summaryRef = useRef<HTMLDivElement | null>(null);

    /** کارتِ بازِ آکاردئون؛ کلیک روی ارگان بدن هم همین را باز می‌کند */
    const [expandedOrgan, setExpandedOrgan] = useState<OrganKey | null>(null);

    /** همهٔ ارگان‌ها مرتب از پرریسک به مطلوب — منبع کارت‌های توصیه */
    const rankedOrgans = useMemo(() => {
      if (!assessment) return [];
      return ORGAN_META
        .map((meta) => ({ key: meta.key, percent: organPercent(assessment.organRisks, meta) }))
        .sort((a, b) => b.percent - a.percent);
    }, [assessment]);

    /**
     * کارت‌ها به‌طور مساوی دو طرف بدن پخش می‌شوند و در هر ستون، از «نیاز به
     * بهبود» به سمت «وضعیت مطلوب» پیش می‌روند: پرریسک‌ترین کارت بالای ستون
     * راست می‌نشیند، بعدی بالای ستون چپ، و همین‌طور یکی‌درمیان.
     * در موبایل ستونی در کار نیست، پس همهٔ کارت‌ها پشت‌سرهم و به همان ترتیب
     * می‌آیند تا ترتیبِ «نیاز به بهبود → مطلوب» به‌هم نخورد.
     */
    const [rightColumn, leftColumn] = useMemo(() => {
      if (compact) return [rankedOrgans, [] as typeof rankedOrgans] as const;
      const right: typeof rankedOrgans = [];
      const left: typeof rankedOrgans = [];
      rankedOrgans.forEach((item, index) => (index % 2 === 0 ? right : left).push(item));
      return [right, left] as const;
    }, [rankedOrgans, compact]);

    /** درصد ریسک ارگان‌های مرتبط — کلید موجود = ارگان فعال روی بدن */
    const organPercents = useMemo<Partial<Record<OrganKey, number>>>(() => {
      const relevant = rankedOrgans.filter((item) => item.percent >= RELEVANCE_THRESHOLD);
      const picked = relevant.length >= MIN_VISIBLE_ORGANS ? relevant : rankedOrgans.slice(0, MIN_VISIBLE_ORGANS);
      return Object.fromEntries(picked.map((item) => [item.key, item.percent]));
    }, [rankedOrgans]);

    /** فلش فقط برای اندام‌هایی که روی بدن فعال‌اند (بقیه کارتشان بدون خط است). */
    const connectorTargets = useMemo<ConnectorTarget[]>(
      () =>
        rankedOrgans
          .filter((item) => organPercents[item.key] != null)
          .map((item) => ({ key: item.key, color: severityOf(item.percent).hex })),
      [rankedOrgans, organPercents],
    );

    /** کلیک روی ارگان بدن: کارتش را باز کن و به آن اسکرول کن */
    const handleSelectOrgan = (key: OrganKey) => {
      setExpandedOrgan((current) => (current === key ? null : key));
      requestAnimationFrame(() => {
        document
          .getElementById(`organ-card-${key}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    };

    return (
      <div className="flex flex-col gap-5" ref={summaryRef}>
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

        {/* پروفایل کاربر */}
        <section className="rounded-3xl border border-white/50 bg-surface/70 p-5 shadow-card backdrop-blur-xl sm:p-6">
          <SectionLabel>پروفایل من</SectionLabel>
          <ProfilePanel
            assessment={assessment}
            record={record}
            history={history}
            baseDelay={0.2}
          />
        </section>

        {/* ✅ نقشهٔ آناتومی: بدن در وسط، کارت‌های توصیه دو طرفش */}
        <section className="rounded-3xl border border-white/50 bg-surface/70 p-5 shadow-card backdrop-blur-xl sm:p-6">
          <div>
            <SectionLabel>نقشهٔ سلامت اندام‌ها</SectionLabel>
            <p className="mb-3 text-[11px] text-ink-subtle">
              {assessment
                ? "کارت‌ها دو طرف بدن و به ترتیب از «نیاز به بهبود» تا «وضعیت مطلوب» چیده شده‌اند و هرکدام با یک خط به اندام خودش وصل است. برای دیدن توصیه‌ها، کارت را باز کنید."
                : "پس از اولین ارزیابی، اندام‌های مرتبط با وضعیت شما اینجا فعال می‌شوند."}
            </p>

            <div
              ref={connectorHostRef}
              className="relative grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)_minmax(0,1fr)] md:gap-3"
            >
              {/* فلش‌های اتصال هر اندام به کارتش — روی بدن رد می‌شوند، زیر کارت‌ها */}
              {assessment && (
                <OrganConnectors
                  hostRef={connectorHostRef}
                  targets={connectorTargets}
                  highlightedOrgan={expandedOrgan}
                  layoutSignal={`${expandedOrgan}-${connectorTargets.length}-${compact}`}
                />
              )}

              {/* ستون راست (در RTL اول می‌آید) */}
              <div className="relative z-20 order-2 md:order-1">
                {assessment ? (
                  <OrganAdviceList
                    items={rightColumn}
                    expandedKey={expandedOrgan}
                    onToggle={(key) =>
                      setExpandedOrgan((current) => (current === key ? null : key))
                    }
                  />
                ) : (
                  <p className="rounded-2xl border border-dashed border-line p-6 text-center text-[11px] text-ink-subtle">
                    کارت‌های توصیه پس از اولین ارزیابی ساخته می‌شوند.
                  </p>
                )}
              </div>

              {/* بدن — وسط، بین دو ستون کارت */}
              <div className="relative z-0 order-1 md:order-2 md:sticky md:top-4 md:self-start">
                <AnatomyFigure
                  organPercents={organPercents}
                  highlightedOrgan={expandedOrgan}
                  onSelectOrgan={handleSelectOrgan}
                />
              </div>

              {/* ستون چپ — در موبایل خالی است */}
              {assessment && leftColumn.length > 0 && (
                <div className="relative z-20 order-3">
                  <OrganAdviceList
                    items={leftColumn}
                    expandedKey={expandedOrgan}
                    onToggle={(key) =>
                      setExpandedOrgan((current) => (current === key ? null : key))
                    }
                    baseDelay={0.08}
                  />
                </div>
              )}
            </div>
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

        {/* دانلود PDF و اشتراک‌گذاری */}
        <section className="pt-2">
          <DashboardActions captureRef={summaryRef} personName={assessment?.fullName ?? null} />
        </section>
      </div>
    );
  }
