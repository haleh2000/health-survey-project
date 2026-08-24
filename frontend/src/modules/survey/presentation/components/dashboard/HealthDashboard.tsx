// src/modules/survey/presentation/components/dashboard/HealthDashboard.tsx

import { motion } from "framer-motion";
import { CalendarCheck, History, ShieldPlus } from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { JALALI_MONTH_NAMES, parseJalaliIso } from "@core/date/jalali";
import { toPersianDigits } from "@core/text/digits";
import { ORGAN_ASSETS } from "@ds/illustrations/anatomy/organ-assets";
import type { AssessmentRecord } from "@survey/infrastructure/storage/assessment-history.storage";

import { BmiGauge, BmiRangeLegend } from "./BmiGauge";
import { BmiComparisonChart } from "./BmiComparisonChart";
import { DashboardActions } from "./DashboardActions";
import { RecommendationTiles } from "./RecommendationTiles";
import { AssessmentHistoryModal } from "./AssessmentHistoryModal";
import { AnatomyFigure } from "../../../../health-dashboard/components/AnatomyFigure";
import {
  OrganConnectors,
  type ConnectorTarget,
} from "../../../../health-dashboard/components/OrganConnectors";
import { ProfilePanel } from "./ProfilePanel";
import type { OrganKey } from "./organ-meta";
import {
  ORGAN_META,
  organPercent,
  severityOf,
} from "./organ-meta";

interface Props {
  record: AssessmentRecord | null;
  history: readonly AssessmentRecord[];
}

const sectionSpring = {
  type: "spring",
  stiffness: 220,
  damping: 26,
} as const;

const readableJalali = (iso: string): string => {
  const parts = parseJalaliIso(iso);

  if (!parts) return iso;

  return `${toPersianDigits(parts.day)} ${
    JALALI_MONTH_NAMES[parts.month - 1]
  } ${toPersianDigits(parts.year)}`;
};

function SectionLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <h3 className="mb-3 text-lg font-black tracking-wide text-day-primary">
      {children}
    </h3>
  );
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 768px)").matches,
  );

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");

    const onChange = (event: MediaQueryListEvent) =>
      setIsDesktop(event.matches);

    mq.addEventListener("change", onChange);

    return () =>
      mq.removeEventListener("change", onChange);
  }, []);

  return isDesktop;
}

const ORGAN_SIDE = Object.fromEntries(
  ORGAN_ASSETS.map((asset) => [asset.key, asset.side]),
) as Record<OrganKey, "left" | "right">;

const ORGAN_ANCHOR_Y = Object.fromEntries(
  ORGAN_ASSETS.map((asset) => [asset.key, asset.anchor.y]),
) as Record<OrganKey, number>;

const CARD_LAYOUT_GAP = 12;
const CARD_LAYOUT_PAD = 8;

export function HealthDashboard({
  record,
  history,
}: Props) {
  const assessment = record?.assessment ?? null;
  const historyCount = history.length;

  // کنترل مودال ارزیابی‌ها
  const [historyOpen, setHistoryOpen] = useState(false);

  const connectorHostRef =
    useRef<HTMLDivElement | null>(null);

  const [expandedOrgan, setExpandedOrgan] =
    useState<OrganKey | null>(null);

  const isDesktop = useIsDesktop();

  const [cardTops, setCardTops] = useState<
    Partial<Record<OrganKey, number>>
  >({});

  const [minHostHeight, setMinHostHeight] =
    useState(0);

  const followUntilRef = useRef(0);
  const frameRef = useRef<number | null>(null);

  const rankedOrgans = useMemo(() => {
    if (!assessment) return [];

    return ORGAN_META
      .map((meta) => ({
        key: meta.key,
        percent: organPercent(
          assessment.organRisks,
          meta,
        ),
      }))
      .sort((a, b) => b.percent - a.percent);
  }, [assessment]);

  const organPercents = useMemo<
    Partial<Record<OrganKey, number>>
  >(
    () =>
      Object.fromEntries(
        rankedOrgans.map((item) => [
          item.key,
          item.percent,
        ]),
      ),
    [rankedOrgans],
  );

  const connectorTargets = useMemo<
    ConnectorTarget[]
  >(
    () =>
      rankedOrgans.map((item) => ({
        key: item.key,
        color: severityOf(item.percent).hex,
      })),
    [rankedOrgans],
  );

  const figurePercents = organPercents;

  const visibleRanked = rankedOrgans;

  const rankIndex = useMemo(
    () =>
      new Map(
        rankedOrgans.map((item, index) => [
          item.key,
          index,
        ]),
      ),
    [rankedOrgans],
  );

  const sideGroups = useMemo(() => {
    const byHeight = (
      a: (typeof rankedOrgans)[number],
      b: (typeof rankedOrgans)[number],
    ) =>
      ORGAN_ANCHOR_Y[a.key] -
        ORGAN_ANCHOR_Y[b.key] ||
      (rankIndex.get(a.key) ?? 0) -
        (rankIndex.get(b.key) ?? 0);

    const columns: Record<
      "left" | "right",
      (typeof rankedOrgans)[number][]
    > = {
      left: [],
      right: [],
    };

    for (const item of visibleRanked) {
      columns[ORGAN_SIDE[item.key]].push(item);
    }

    while (
      columns.left.length -
        columns.right.length >=
        2 ||
      columns.right.length -
        columns.left.length >=
        2
    ) {
      const from =
        columns.left.length >
        columns.right.length
          ? "left"
          : "right";

      const to =
        from === "left" ? "right" : "left";

      const lowestPriority = columns[from].reduce(
        (worst, item) =>
          (rankIndex.get(item.key) ?? 0) >
          (rankIndex.get(worst.key) ?? 0)
            ? item
            : worst,
      );

      columns[from] = columns[from].filter(
        (item) =>
          item.key !== lowestPriority.key,
      );

      columns[to].push(lowestPriority);
    }

    return {
      right: columns.right.sort(byHeight),
      left: columns.left.sort(byHeight),
    };
  }, [visibleRanked, rankIndex]);

  const measureCards = useCallback(() => {
    const host = connectorHostRef.current;

    if (!host || !assessment || !isDesktop) return;

    const hostRect = host.getBoundingClientRect();

    if (hostRect.width === 0) return;

    const tops: Partial<
      Record<OrganKey, number>
    > = {};

    let needed = 0;

    for (const side of ["right", "left"] as const) {
      let cursor = CARD_LAYOUT_PAD;

      for (const item of sideGroups[side]) {
        const anchor =
          host.querySelector<SVGCircleElement>(
            `[data-organ-anchor="${item.key}"]`,
          );

        const card = document.getElementById(
          `organ-card-${item.key}`,
        );

        if (!anchor || !card) continue;

        const anchorRect =
          anchor.getBoundingClientRect();

        const cardHeight = card.offsetHeight;

        if (
          anchorRect.width === 0 ||
          cardHeight === 0
        ) {
          continue;
        }

        const anchorY =
          anchorRect.top +
          anchorRect.height / 2 -
          hostRect.top;

        const top = Math.max(
          anchorY - cardHeight / 2,
          cursor,
        );

        tops[item.key] = top;

        cursor =
          top +
          cardHeight +
          CARD_LAYOUT_GAP;
      }

      if (cursor > CARD_LAYOUT_GAP) {
        needed = Math.max(needed, cursor);
      }
    }

    setCardTops(tops);
    setMinHostHeight(needed);
  }, [
    assessment,
    isDesktop,
    sideGroups,
  ]);

  const startFollowing = useCallback(() => {
    followUntilRef.current =
      performance.now() + 900;

    if (frameRef.current !== null) return;

    const tick = () => {
      measureCards();

      if (
        performance.now() <
        followUntilRef.current
      ) {
        frameRef.current =
          requestAnimationFrame(tick);
      } else {
        frameRef.current = null;
      }
    };

    frameRef.current =
      requestAnimationFrame(tick);
  }, [measureCards]);

  useLayoutEffect(() => {
    startFollowing();

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(
          frameRef.current,
        );
        frameRef.current = null;
      }
    };
  }, [startFollowing, expandedOrgan]);

  useEffect(() => {
    const host = connectorHostRef.current;

    if (!host || !isDesktop) return;

    const onViewportChange = () =>
      measureCards();

    window.addEventListener(
      "resize",
      onViewportChange,
    );

    const observer = new ResizeObserver(
      onViewportChange,
    );

    observer.observe(host);

    return () => {
      window.removeEventListener(
        "resize",
        onViewportChange,
      );

      observer.disconnect();
    };
  }, [isDesktop, measureCards]);

  const handleSelectOrgan = (
    key: OrganKey,
  ) => {
    setExpandedOrgan((current) =>
      current === key ? null : key,
    );

    requestAnimationFrame(() => {
      document
        .getElementById(
          `organ-card-${key}`,
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    });
  };

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
              {assessment
                ? `سلام، ${assessment.fullName} 👋`
                : "خلاصه وضعیت سلامت شما"}
            </h2>

            <p className="text-xs leading-6 text-ink-muted sm:text-sm">
              {assessment
                ? "این تصویر سلامت شما بر اساس آخرین ارزیابی است."
                : "بینش سلامت شما بر اساس عادت‌ها و سوابق پزشکی — بعد از اولین ارزیابی فعال می‌شود."}
            </p>
          </div>
        </div>

        {/* سوابق ارزیابی */}
        <div className="flex flex-wrap items-center gap-2">
          <motion.button
            type="button"
            onClick={() =>
              setHistoryOpen(true)
            }
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-day-primary/10 px-3 py-1.5 text-xs font-bold text-day-primary transition hover:bg-day-primary/15"
          >
            <History className="h-3.5 w-3.5" />
            مشاهده ارزیابی‌های من
          </motion.button>

          {record && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1.5 text-xs font-semibold text-ink-muted">
              <CalendarCheck className="h-3.5 w-3.5" />
              آخرین:{" "}
              {readableJalali(
                record.completedOnJalali,
              )}
            </span>
          )}
        </div>
      </motion.section>

      {/* مودال ارزیابی‌ها */}
      <AssessmentHistoryModal
        open={historyOpen}
        onClose={() =>
          setHistoryOpen(false)
        }
        history={history}
      />

      {/* ── بخش اصلی: سوابق + نقشه بدن + کارت‌های دو طرف ── */}
      <section className="rounded-3xl border border-white/50 bg-surface/70 p-5 shadow-card backdrop-blur-xl sm:p-6">
        {/* وضعیت */}
        <div className="mb-5">
          <SectionLabel>
            سوابق و وضعیت
          </SectionLabel>

          <ProfilePanel
            assessment={assessment}
            record={record}
            baseDelay={0.05}
          />
        </div>

        <div>
          <SectionLabel>
            نقشه سلامت اعضای بدن
          </SectionLabel>

          <p className="mb-4 text-[15px] text-ink-subtle">
            {assessment
              ? "شماره روی هر کارت اولویت پیگیری است: (۱ یعنی بیشترین نیاز). با مراجعه به هر کارت درصد نیاز به پیگیری شما مشخص شده است؛ همچنین با مراجعه به جزئیات هر کارت می‌توانید توصیه‌های سلامت مربوط به آن اندام را دریافت کنید."
              : "پس از اولین ارزیابی، اندام‌های مرتبط با وضعیت شما اینجا فعال می‌شوند."}
          </p>

          <div
            ref={connectorHostRef}
            className="relative grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,1fr)]"
            style={
              isDesktop &&
              minHostHeight > 0
                ? {
                    minHeight: `${minHostHeight}px`,
                  }
                : undefined
            }
          >
            {assessment && (
              <OrganConnectors
                hostRef={connectorHostRef}
                targets={connectorTargets}
                highlightedOrgan={
                  expandedOrgan
                }
                layoutSignal={`${connectorTargets.length}`}
              />
            )}

            {/* موبایل */}
            {!isDesktop ? (
              <>
                <div className="relative z-0">
                  <AnatomyFigure
                    organPercents={
                      figurePercents
                    }
                    highlightedOrgan={
                      expandedOrgan
                    }
                    onSelectOrgan={
                      handleSelectOrgan
                    }
                  />
                </div>

                <div className="relative z-20 flex flex-col gap-3">
                  {assessment ? (
                    visibleRanked.map(
                      (item) => (
                        <SingleOrganCard
                          key={item.key}
                          item={item}
                          rank={rankIndex.get(
                            item.key,
                          )}
                          expandedKey={
                            expandedOrgan
                          }
                          onToggle={(key) =>
                            setExpandedOrgan(
                              (current) =>
                                current === key
                                  ? null
                                  : key,
                            )
                          }
                        />
                      ),
                    )
                  ) : (
                    <EmptyCardPlaceholder />
                  )}
                </div>
              </>
            ) : (
              <>
                {/* ستون راست */}
                <div className="relative z-20 flex flex-col gap-3">
                  {assessment ? (
                    sideGroups.right.map(
                      (item) => (
                        <div
                          key={item.key}
                          className="transition-[top] duration-300 ease-out md:absolute md:inset-x-0"
                          style={
                            cardTops[item.key] !=
                            null
                              ? {
                                  top: `${cardTops[item.key]}px`,
                                }
                              : undefined
                          }
                        >
                          <SingleOrganCard
                            item={item}
                            rank={rankIndex.get(
                              item.key,
                            )}
                            expandedKey={
                              expandedOrgan
                            }
                            onToggle={(key) =>
                              setExpandedOrgan(
                                (current) =>
                                  current === key
                                    ? null
                                    : key,
                              )
                            }
                          />
                        </div>
                      ),
                    )
                  ) : (
                    <EmptyCardPlaceholder />
                  )}
                </div>

                {/* ستون وسط */}
                <div className="relative z-0 sticky top-20 md:top-24">
                  <AnatomyFigure
                    organPercents={
                      figurePercents
                    }
                    highlightedOrgan={
                      expandedOrgan
                    }
                    onSelectOrgan={
                      handleSelectOrgan
                    }
                  />
                </div>

                {/* ستون چپ */}
                <div className="relative z-20 flex flex-col gap-3">
                  {assessment ? (
                    sideGroups.left.map(
                      (item) => (
                        <div
                          key={item.key}
                          className="transition-[top] duration-300 ease-out md:absolute md:inset-x-0"
                          style={
                            cardTops[item.key] !=
                            null
                              ? {
                                  top: `${cardTops[item.key]}px`,
                                }
                              : undefined
                          }
                        >
                          <SingleOrganCard
                            item={item}
                            rank={rankIndex.get(
                              item.key,
                            )}
                            expandedKey={
                              expandedOrgan
                            }
                            onToggle={(key) =>
                              setExpandedOrgan(
                                (current) =>
                                  current === key
                                    ? null
                                    : key,
                              )
                            }
                          />
                        </div>
                      ),
                    )
                  ) : (
                    <EmptyCardPlaceholder />
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── BMI ── */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          ...sectionSpring,
          delay: 0.25,
        }}
        className="rounded-3xl border border-white/50 bg-surface/70 p-5 shadow-card backdrop-blur-xl sm:p-6"
      >
        <div className="mb-4 flex items-baseline gap-2">
          <h3 className="text-sm font-black text-ink">
            شاخص توده بدنی (BMI)
          </h3>

          <span className="text-[11px] text-ink-subtle">
            {assessment?.bmi != null
              ? "وضعیت بدن شما در یک نگاه"
              : "پس از ارزیابی محاسبه می‌شود"}
          </span>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <div className="flex flex-col gap-4">
            <BmiGauge
              bmi={assessment?.bmi ?? null}
            />

            <BmiRangeLegend
              bmi={assessment?.bmi ?? null}
            />
          </div>

          <div>
            <h4 className="mb-1 text-xs font-black text-day-primary">
              مقایسه با محدوده نرمال
            </h4>

            <BmiComparisonChart
              bmi={assessment?.bmi ?? null}
            />
          </div>
        </div>
      </motion.section>

      {/* ── توصیه‌های روزانه ── */}
      <section className="rounded-3xl border border-white/50 bg-surface/70 p-5 shadow-card backdrop-blur-xl sm:p-6">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-sm font-black text-ink">
            پیشنهادهای روزانه
          </span>
        </div>

        <RecommendationTiles
          baseDelay={0.35}
          tier={assessment?.tier ?? null}
        />
      </section>

      {/* ── دانلود PDF و اشتراک‌گذاری ── */}
      <section className="pt-2">
        <DashboardActions
          record={record}
          history={history}
          personName={
            assessment?.fullName ?? null
          }
        />
      </section>
    </div>
  );
}

// ─── کامپوننت کمکی: یک کارت تکی از OrganAdviceList ─────────────────────────

import {
  AnimatePresence,
  motion as m,
} from "framer-motion";
import { ChevronDown } from "lucide-react";
import {
  toPersianDigits as tpd,
} from "@core/text/digits";
import {
  ORGAN_CONTENT,
  ORGAN_META as OM,
  severityOf as sev,
} from "./organ-meta";
import type { RankedOrgan } from "./OrganAdviceList";

const cardSpring = {
  type: "spring",
  stiffness: 260,
  damping: 28,
} as const;

interface SingleCardProps {
  item: RankedOrgan;
  rank?: number;
  expandedKey: OrganKey | null;
  onToggle: (key: OrganKey) => void;
}

function SingleOrganCard({
  item,
  rank,
  expandedKey,
  onToggle,
}: SingleCardProps) {
  const meta = OM.find(
    (m) => m.key === item.key,
  );

  const content =
    ORGAN_CONTENT[item.key];

  const severity = sev(item.percent);
  const isOpen =
    expandedKey === item.key;

  return (
    <m.div
      id={`organ-card-${item.key}`}
      initial={{
        opacity: 0,
        y: 18,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        ...cardSpring,
        delay:
          Math.min(rank ?? 0, 5) * 0.05,
      }}
      className="overflow-hidden rounded-2xl border bg-surface/90 shadow-card backdrop-blur-md"
      style={{
        borderColor: isOpen
          ? `${severity.hex}66`
          : "var(--color-line, #e5e7eb)",
      }}
    >
      <button
        type="button"
        onClick={() =>
          onToggle(item.key)
        }
        aria-expanded={isOpen}
        className="flex w-full cursor-pointer flex-col gap-2 p-4 text-right"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {rank != null && (
              <span
                className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-black text-white"
                style={{
                  backgroundColor:
                    severity.hex,
                }}
                title={`اولویت ${tpd(rank + 1)}`}
              >
                {tpd(rank + 1)}
              </span>
            )}

            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{
                backgroundColor:
                  severity.hex,
              }}
              aria-hidden
            />

            <span className="text-sm font-black text-ink">
              {meta?.label}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${severity.chipClass}`}
            >
              {severity.label}
            </span>

            <m.span
              animate={{
                rotate: isOpen
                  ? 180
                  : 0,
              }}
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
              style={{
                backgroundColor:
                  severity.hex,
              }}
              initial={{
                width: 0,
              }}
              animate={{
                width: `${item.percent}%`,
              }}
              transition={{
                type: "spring",
                stiffness: 120,
                damping: 20,
                delay: 0.2,
              }}
            />
          </div>

          <span
            className="text-[11px] font-bold tabular-nums"
            style={{
              color: severity.hex,
            }}
          >
            {tpd(item.percent)}٪
          </span>
        </div>

        <p className="line-clamp-3 text-[13px] leading-relaxed text-ink-subtle">
          {content.description}
        </p>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <m.div
            key="body"
            initial={{
              height: 0,
              opacity: 0,
            }}
            animate={{
              height: "auto",
              opacity: 1,
            }}
            exit={{
              height: 0,
              opacity: 0,
            }}
            transition={{
              type: "spring",
              stiffness: 240,
              damping: 30,
            }}
            className="overflow-hidden"
          >
            <div className="border-t border-line px-4 pb-4 pt-3">
              <h5 className="mb-1.5 text-[13px] font-bold text-ink">
                توصیه‌های سلامت
              </h5>

              <ul className="space-y-1.5">
                {content.tips.map(
                  (tip) => (
                    <li
                      key={tip}
                      className="flex items-start gap-1.5"
                    >
                      <span
                        className="mt-1.5 h-1 w-1 shrink-0 rounded-full"
                        style={{
                          backgroundColor:
                            severity.hex,
                        }}
                        aria-hidden
                      />

                      <span className="text-[13px] leading-relaxed text-ink-subtle">
                        {tip}
                      </span>
                    </li>
                  ),
                )}
              </ul>

              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2.5 dark:border-red-900 dark:bg-red-950/30">
                <h5 className="mb-0.5 text-[13px] font-bold text-red-700 dark:text-red-400">
                  علائم هشداردهنده
                </h5>

                <p className="text-[12px] leading-relaxed text-red-600 dark:text-red-400/80">
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