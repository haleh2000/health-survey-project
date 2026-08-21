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

/**
 * تقسیم آرایه‌ی ranked به دو ستون چپ و راست به‌صورت متناوب
 * (ایندکس زوج → راست، ایندکس فرد → چپ تا چیدمان متقارن باشد)
 */
function splitColumns<T>(items: readonly T[]): { left: T[]; right: T[] } {
  const right: T[] = [];
  const left: T[] = [];
  items.forEach((item, i) => {
    if (i % 2 === 0) right.push(item);
    else left.push(item);
  });
  return { left, right };
}

export function HealthDashboard({ record, history }: Props) {
  const assessment = record?.assessment ?? null;
  const historyCount = history.length;

  const connectorHostRef = useRef<HTMLDivElement | null>(null);
  const [expandedOrgan, setExpandedOrgan] = useState<OrganKey | null>(null);
  const [showAllCards, setShowAllCards] = useState(false);

  const rankedOrgans = useMemo(() => {
    if (!assessment) return [];
    return ORGAN_META
      .map((meta) => ({ key: meta.key, percent: organPercent(assessment.organRisks, meta) }))
      .sort((a, b) => b.percent - a.percent);
  }, [assessment]);

  const organPercents = useMemo<Partial<Record<OrganKey, number>>>(() => {
    const relevant = rankedOrgans.filter((item) => item.percent >= RELEVANCE_THRESHOLD);
    const picked = relevant.length >= MIN_VISIBLE_ORGANS ? relevant : rankedOrgans.slice(0, MIN_VISIBLE_ORGANS);
    return Object.fromEntries(picked.map((item) => [item.key, item.percent]));
  }, [rankedOrgans]);
  
const connectorTargets = useMemo<ConnectorTarget[]>(() => {
  const visible = showAllCards ? rankedOrgans : rankedOrgans.slice(0, 3);
  return visible.map((item) => ({ key: item.key, color: severityOf(item.percent).hex }));
}, [rankedOrgans, showAllCards]);

/**
 * ارگان‌های فعال روی تصویر بدن: علاوه بر ارگان‌های مرتبط، هر ارگانی که کارتش
 * نمایان است (حالت «نمایش بیشتر») هم باید نقطهٔ اتصال روی بدن داشته باشد،
 * وگرنه خط راهنمای آن رسم نمی‌شود.
 */
const figurePercents = useMemo<Partial<Record<OrganKey, number>>>(() => {
  const visible = showAllCards ? rankedOrgans : rankedOrgans.slice(0, 3);
  const merged: Partial<Record<OrganKey, number>> = { ...organPercents };
  for (const item of visible) merged[item.key] = item.percent;
  return merged;
}, [organPercents, rankedOrgans, showAllCards]);


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

  // کارت‌های قابل نمایش (۳ تا یا همه)
  const visibleRanked = showAllCards ? rankedOrgans : rankedOrgans.slice(0, 3);
  const { left: leftCards, right: rightCards } = splitColumns(visibleRanked);
  const hiddenCount = rankedOrgans.length - 3;

  return (
    <div className="flex flex-col gap-5">
      {/* ── Header ── */}
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

      {/* ── بخش اصلی: سوابق + نقشه بدن + کارت‌های دو طرف ── */}
      <section className="rounded-3xl border border-white/50 bg-surface/70 p-5 shadow-card backdrop-blur-xl sm:p-6">

        {/* سوابق و وضعیت — بالای نقشه آناتومی */}
        <div className="mb-5">
          <SectionLabel>سوابق و وضعیت</SectionLabel>
          <ProfilePanel
            assessment={assessment}
            record={record}
            history={history}
            baseDelay={0.05}
          />
        </div>

        {/* نقشه بدن + کارت‌های دو ستون */}
        <div>
          <SectionLabel>نقشهٔ سلامت اندام‌ها</SectionLabel>
          <p className="mb-4 text-[11px] text-ink-subtle">
            {assessment
              ? "کارت‌ها به ترتیب از «نیاز به پیگیری» تا «وضعیت مطلوب» مرتب شده‌اند. برای دیدن توصیه‌های هر اندام، کارت آن را باز کنید."
              : "پس از اولین ارزیابی، اندام‌های مرتبط با وضعیت شما اینجا فعال می‌شوند."}
          </p>

          {/*
            چیدمان سه‌ستونه:
              موبایل  → یک ستون (کارت‌ها بالا، بدن پایین)
              دسکتاپ → [ستون‌کارت-راست | بدن | ستون‌کارت-چپ]
          */}
          <div
            ref={connectorHostRef}
            className="relative grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,1fr)]"
          >
            {/* فلش‌های اتصال */}
            {assessment && (
              <OrganConnectors
                hostRef={connectorHostRef}
                targets={connectorTargets}
                highlightedOrgan={expandedOrgan}
                layoutSignal={`${showAllCards}-${connectorTargets.length}`}
              />
            )}

            {/* ستون راست — ایندکس‌های زوج (۰، ۲، ۴، …) */}
            <div className="relative z-10 flex flex-col gap-3">
              {assessment ? (
                <>
                  {rightCards.map((item, index) => {
                    // رندر تک‌کارت با OrganAdviceList با ranked={[item]}
                    return (
                      <SingleOrganCard
                        key={item.key}
                        item={item}
                        index={index * 2}
                        expandedKey={expandedOrgan}
                        onToggle={(key) =>
                          setExpandedOrgan((current) => (current === key ? null : key))
                        }
                      />
                    );
                  })}
                </>
              ) : (
                <EmptyCardPlaceholder />
              )}
            </div>

            {/* ستون وسط — نقشه آناتومی (sticky در دسکتاپ) */}
            <div className="relative z-10 md:sticky md:top-4 md:self-start">
              <AnatomyFigure
                organPercents={figurePercents}
                highlightedOrgan={expandedOrgan}
                onSelectOrgan={handleSelectOrgan}
              />
            </div>

            {/* ستون چپ — ایندکس‌های فرد (۱، ۳، ۵، …) */}
            <div className="relative z-10 flex flex-col gap-3">
              {assessment ? (
                <>
                  {leftCards.map((item, index) => (
                    <SingleOrganCard
                      key={item.key}
                      item={item}
                      index={index * 2 + 1}
                      expandedKey={expandedOrgan}
                      onToggle={(key) =>
                        setExpandedOrgan((current) => (current === key ? null : key))
                      }
                    />
                  ))}
                </>
              ) : (
                <EmptyCardPlaceholder />
              )}
            </div>
          </div>

          {/* دکمه نمایش بیشتر/کمتر — زیر سه‌ستون */}
          {assessment && hiddenCount > 0 && (
            <motion.button
              type="button"
              onClick={() => setShowAllCards((v) => !v)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="mt-4 w-full cursor-pointer rounded-2xl border border-dashed border-day-primary/40
                         bg-day-primary/5 py-2.5 text-xs font-bold text-day-primary transition
                         hover:bg-day-primary/10"
            >
              {showAllCards
                ? "نمایش کمتر"
                : `نمایش ${toPersianDigits(hiddenCount)} مورد دیگر`}
            </motion.button>
          )}
        </div>
      </section>

      {/* ── BMI ── */}
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

      {/* ── توصیه‌های روزانه ── */}
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

// ─── کامپوننت کمکی: یک کارت تکی از OrganAdviceList ─────────────────────────

import { AnimatePresence, motion as m } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { toPersianDigits as tpd } from "@core/text/digits";
import { ORGAN_CONTENT, ORGAN_META as OM, severityOf as sev } from "./organ-meta";
import type { RankedOrgan } from "./OrganAdviceList";

const cardSpring = { type: "spring", stiffness: 260, damping: 28 } as const;

interface SingleCardProps {
  item: RankedOrgan;
  index: number;
  expandedKey: OrganKey | null;
  onToggle: (key: OrganKey) => void;
}

function SingleOrganCard({ item, index, expandedKey, onToggle }: SingleCardProps) {
  const meta = OM.find((m) => m.key === item.key);
  const content = ORGAN_CONTENT[item.key];
  const severity = sev(item.percent);
  const isOpen = expandedKey === item.key;

  return (
    <m.div
      id={`organ-card-${item.key}`}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...cardSpring, delay: Math.min(index, 5) * 0.05 }}
      className="overflow-hidden rounded-2xl border bg-surface/90 shadow-card backdrop-blur-md"
      style={{ borderColor: isOpen ? `${severity.hex}66` : "var(--color-line, #e5e7eb)" }}
    >
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
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${severity.chipClass}`}>
              {severity.label}
            </span>
            <m.span
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={cardSpring}
              className="grid h-6 w-6 place-items-center rounded-full bg-surface-muted text-ink-subtle"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </m.span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
            <m.div
              className="h-full rounded-full"
              style={{ backgroundColor: severity.hex }}
              initial={{ width: 0 }}
              animate={{ width: `${item.percent}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.2 }}
            />
          </div>
          <span className="text-[11px] font-bold tabular-nums" style={{ color: severity.hex }}>
            {tpd(item.percent)}٪
          </span>
        </div>

        <p className="text-[11px] leading-relaxed text-ink-subtle line-clamp-3">
          {content.description}
        </p>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <m.div
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
          </m.div>
        )}
      </AnimatePresence>
    </m.div>
  );
}

function EmptyCardPlaceholder() {
  return (
    <p className="rounded-2xl border border-dashed border-line p-6 text-center text-[11px] text-ink-subtle">
      کارت‌های توصیه پس از اولین ارزیابی ساخته می‌شوند.
    </p>
  );
}



