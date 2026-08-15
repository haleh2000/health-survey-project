// src/modules/survey/presentation/sections/RiskHistorySummarySection.tsx
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getActiveCausalFactors, ORGAN_CAUSAL_FACTORS } from "@survey/domain/causal-alerts";
import type { RiskAssessment } from "@survey/domain/entities/risk-assessment.entity";
import type { TierConfig } from "./TierConfig";

/* ------------------------------------------------------------------ */
/*  Static data                                                          */
/* ------------------------------------------------------------------ */

const ORGAN_ICONS: Record<string, string> = {
  lung:      "🫁",
  gastric:   "🫙",
  colon:     "🔵",
  pancreas:  "🟡",
  stroke:    "🧠",
  cardiac:   "❤️",
  metabolic: "⚡",
  liver:     "🟤",
};

const HISTORY_ORGANS = new Set(["colon", "metabolic"]);

const SEVERITY_COLORS: Record<string, { badge: string; dot: string }> = {
  بالا:   { badge: "bg-red-100 text-red-700",    dot: "bg-red-500"    },
  متوسط: { badge: "bg-amber-100 text-amber-700", dot: "bg-amber-500"  },
  کم:    { badge: "bg-slate-100 text-slate-600", dot: "bg-slate-400"  },
};

const AVATAR_ANCHORS: Record<string, { top: string; left: string }> = {
  lung:      { top: "8%",  left: "50%" },
  cardiac:   { top: "35%", left: "82%" },
  gastric:   { top: "35%", left: "18%" },
  stroke:    { top: "62%", left: "18%" },
  liver:     { top: "62%", left: "82%" },
  colon:     { top: "88%", left: "50%" },
};

/* ------------------------------------------------------------------ */
/*  Helper                                                               */
/* ------------------------------------------------------------------ */

function getSeverityStyle(severity: string): { badge: string; dot: string } {
  return SEVERITY_COLORS[severity] ?? (SEVERITY_COLORS["کم"] as { badge: string; dot: string });
}

/* ------------------------------------------------------------------ */
/*  RiskCard                                                             */
/* ------------------------------------------------------------------ */

interface RiskCardProps {
  organKey: string;
  score: number;
  assessment: RiskAssessment;
  config: TierConfig;
  isSelected: boolean;
  onSelect: (key: string | null) => void;
}

function RiskCard({ organKey, score, assessment, isSelected, onSelect }: RiskCardProps) {
  const factors    = getActiveCausalFactors(organKey, assessment.flags);
  const organInfo  = ORGAN_CAUSAL_FACTORS[organKey];
  const pct        = Math.min(Math.round((score / 20) * 100), 100);
  const topFactor  = factors[0];
  const severityStyle = topFactor ? getSeverityStyle(topFactor.severity) : null;

  const tierLabel =
    pct >= 70 ? "بالا" :
    pct >= 40 ? "متوسط" :
    "پایین";

  const tierTextColor =
    pct >= 70 ? "text-red-500" :
    pct >= 40 ? "text-amber-500" :
    "text-emerald-500";

  return (
    <motion.button
      type="button"
      layout
      onClick={() => onSelect(isSelected ? null : organKey)}
      className={`w-full text-right rounded-2xl border p-3 transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
        isSelected
          ? "border-teal-400 bg-teal-50 shadow-md"
          : "border-slate-100 bg-white shadow-sm hover:shadow-md hover:border-teal-200"
      }`}
      aria-expanded={isSelected}
      aria-label={`جزئیات ریسک ${organInfo?.organLabel ?? organKey}`}
    >
      {/* Row 1 */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl leading-none" aria-hidden="true">
          {ORGAN_ICONS[organKey] ?? "•"}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800 leading-tight">
            {organInfo?.organLabel ?? organKey}
          </p>
          <p className={`text-xs font-semibold ${tierTextColor}`}>{tierLabel}</p>
        </div>
        <span className={`text-lg font-extrabold ${tierTextColor}`}>{pct}٪</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 mb-2">
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, #2dd4bf, #f59e0b, #ef4444)",
            backgroundSize: "200% 100%",
            backgroundPosition: `${100 - pct}% 0`,
          }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      {/* Top causal factor */}
      {topFactor && severityStyle && (
        <div className="flex items-center gap-1.5">
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${severityStyle.dot}`} aria-hidden="true" />
          <span className={`text-xs rounded-full px-2 py-0.5 font-medium ${severityStyle.badge}`}>
            {topFactor.label}
          </span>
          <span className="text-xs text-slate-400 mr-auto">تأثیر بالا</span>
        </div>
      )}

      {/* Expanded detail */}
      <AnimatePresence initial={false}>
        {isSelected && (
          <motion.div
            key="detail"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-teal-100 space-y-2 text-right">
              {organInfo?.description && (
                <p className="text-xs text-slate-600 leading-relaxed">{organInfo.description}</p>
              )}
              {factors.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1">عوامل دخیل:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {factors.map((f) => {
                      const s = getSeverityStyle(f.severity);
                      return (
                        <span key={f.key} className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.badge}`}>
                          {f.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
              {organInfo?.recommendation && (
                <p className="text-xs text-teal-700 bg-teal-50 rounded-xl px-3 py-2 leading-relaxed">
                  💡 {organInfo.recommendation}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/*  HistoryCard                                                          */
/* ------------------------------------------------------------------ */

interface HistoryCardProps {
  organKey: string;
  score: number;
  assessment: RiskAssessment;
  config: TierConfig;
}

function HistoryCard({ organKey, score, assessment, config }: HistoryCardProps) {
  const [open, setOpen]  = useState(false);
  const organInfo        = ORGAN_CAUSAL_FACTORS[organKey];
  const factors          = getActiveCausalFactors(organKey, assessment.flags);
  const pct              = Math.min(Math.round((score / 20) * 100), 100);
  const status           = score === 0 ? "خوب" : pct < 40 ? "متوسط" : "نیاز به توجه";
  const statusColor      = score === 0 ? "text-teal-600" : pct < 40 ? "text-amber-500" : "text-red-500";
  const hasDetail        = factors.length > 0 || !!organInfo?.recommendation;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${config.accentBgClass}`}>
          <span aria-hidden="true">{ORGAN_ICONS[organKey] ?? "•"}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800">{organInfo?.organLabel ?? organKey}</p>
          <p className={`text-xs font-semibold ${statusColor}`}>{status}</p>
          <p className="text-xs text-slate-400 mt-0.5 leading-snug">
            {score === 0 ? "هیچ ناهنجاری یافت نشد" : "مصرف را زیر نظر داشته باشید"}
          </p>
        </div>
        {hasDetail ? (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${config.accentBgClass} ${config.accentTextClass} hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400`}
            aria-label={`جزئیات ${organInfo?.organLabel ?? organKey}`}
          >
            <svg
              width="14" height="14" viewBox="0 0 24 24"
              fill="none" aria-hidden="true"
              className={`transition-transform duration-200 ${open ? "rotate-90" : ""}`}
            >
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        ) : (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${config.accentBgClass}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"
                 className={config.accentTextClass}>
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
      </div>

      <AnimatePresence initial={false}>
        {open && hasDetail && (
          <motion.div
            key="hdetail"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
              {factors.map((f) => {
                const s = getSeverityStyle(f.severity);
                return (
                  <span key={f.key} className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium mr-1 ${s.badge}`}>
                    {f.label}
                  </span>
                );
              })}
              {organInfo?.recommendation && (
                <p className="text-xs text-teal-700 bg-teal-50 rounded-xl px-3 py-2 leading-relaxed mt-1">
                  💡 {organInfo.recommendation}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  BodyAvatar                                                           */
/* ------------------------------------------------------------------ */

interface AvatarProps {
  activeOrgans: string[];
  selectedOrgan: string | null;
  onOrganClick: (key: string | null) => void;
  config: TierConfig;
  onHistoryClick: () => void;
}

function BodyAvatar({ activeOrgans, selectedOrgan, onOrganClick, config, onHistoryClick }: AvatarProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-48 h-56 sm:w-56 sm:h-64">
        <div className={`absolute inset-4 rounded-full opacity-20 blur-xl ${config.accentBgClass}`} />
        <div className="absolute inset-0 rounded-full border-2 border-teal-200/60" />

        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 60 120" className="h-40 sm:h-48 opacity-60" fill="none" aria-hidden="true">
            <circle cx="30" cy="10" r="8" fill="#5eead4" opacity="0.7"/>
            <rect x="20" y="20" width="20" height="35" rx="6" fill="#5eead4" opacity="0.5"/>
            <rect x="6"  y="22" width="12" height="5" rx="2.5" fill="#5eead4" opacity="0.4"/>
            <rect x="42" y="22" width="12" height="5" rx="2.5" fill="#5eead4" opacity="0.4"/>
            <rect x="21" y="56" width="8"  height="35" rx="4" fill="#5eead4" opacity="0.5"/>
            <rect x="31" y="56" width="8"  height="35" rx="4" fill="#5eead4" opacity="0.5"/>
          </svg>
        </div>

        {activeOrgans
          .filter((k): k is keyof typeof AVATAR_ANCHORS => k in AVATAR_ANCHORS)
          .map((organKey) => {
            const anchor   = AVATAR_ANCHORS[organKey]!;
            const isActive = selectedOrgan === organKey;
            return (
              <button
                key={organKey}
                type="button"
                onClick={() => onOrganClick(isActive ? null : organKey)}
                className={`absolute -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-base transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
                  isActive
                    ? `${config.accentBgClass} shadow-lg scale-110`
                    : "bg-white border-2 border-teal-200 hover:border-teal-400 hover:scale-105"
                }`}
                style={{ top: anchor.top, left: anchor.left }}
                aria-label={ORGAN_CAUSAL_FACTORS[organKey]?.organLabel ?? organKey}
                aria-pressed={isActive}
              >
                <span aria-hidden="true">{ORGAN_ICONS[organKey] ?? "•"}</span>
              </button>
            );
          })}
      </div>

      <button
        type="button"
        onClick={onHistoryClick}
        className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 active:scale-95"
        style={{ background: "linear-gradient(135deg, #0d9488, #0891b2)" }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M3 3v5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        تاریخچه ارزیابی‌ها
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main section                                                         */
/* ------------------------------------------------------------------ */

interface Props {
  assessment: RiskAssessment;
  config: TierConfig;
  onHistoryOpen?: () => void;
}

export function RiskHistorySummarySection({ assessment, config, onHistoryOpen }: Props) {
  const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null);

  const organKeys    = Object.keys(assessment.organRisks) as Array<keyof typeof assessment.organRisks>;
  const activeOrgans = organKeys.filter((k) => assessment.organRisks[k] > 0);

  const riskOrgans    = activeOrgans.filter((k) => !HISTORY_ORGANS.has(k));
  const historyOrgans = activeOrgans.filter((k) => HISTORY_ORGANS.has(k));

  const handleSelect = (key: string | null) => setSelectedOrgan(key);

  return (
    <section
      aria-label="خلاصه ریسک و تاریخچه سلامت"
      className="rounded-3xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm"
      dir="rtl"
    >
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <div className={`rounded-2xl p-2.5 ${config.accentBgClass}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
               aria-hidden="true" className={config.accentTextClass}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                  stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <h2 className="text-base font-extrabold text-slate-800">سلامت و تاریخچه پزشکی</h2>
          <p className="text-xs text-slate-400">بر اساس عادات و سابقه پزشکی شما</p>
        </div>
      </div>

      {/* ── Three-column grid ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-start">

        {/* RIGHT col — Risk Analysis (rtl → visually right) */}
        <div className="flex flex-col gap-3 min-w-0">
          {/* Sticky column label */}
          <p className="sticky top-0 z-10 -mx-1 px-1 pb-2 pt-0.5
                        bg-gradient-to-b from-slate-50 via-slate-50/95 to-transparent
                        text-[11px] font-bold tracking-widest text-teal-600">
            تحلیل ریسک
          </p>

          {/* Scrollable card list */}
          <div className="flex flex-col gap-3 sm:max-h-[480px] sm:overflow-y-auto
                          sm:pr-0.5 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            {riskOrgans.length > 0 ? (
              riskOrgans.map((organKey) => (
                <RiskCard
                  key={organKey}
                  organKey={organKey}
                  score={assessment.organRisks[organKey as keyof typeof assessment.organRisks]}
                  assessment={assessment}
                  config={config}
                  isSelected={selectedOrgan === organKey}
                  onSelect={handleSelect}
                />
              ))
            ) : (
              <p className="text-sm text-slate-400 py-4 text-center">ریسک فعالی یافت نشد.</p>
            )}
          </div>
        </div>

        {/* CENTER — Body Avatar (sticky while columns scroll) */}
        <div className="flex justify-center sm:sticky sm:top-4 sm:self-start">
          <BodyAvatar
            activeOrgans={activeOrgans as string[]}
            selectedOrgan={selectedOrgan}
            onOrganClick={handleSelect}
            config={config}
            onHistoryClick={onHistoryOpen ?? (() => {})}
          />
        </div>

        {/* LEFT col — Medical History */}
        <div className="flex flex-col gap-3 min-w-0">
          <p className="sticky top-0 z-10 -mx-1 px-1 pb-2 pt-0.5
                        bg-gradient-to-b from-slate-50 via-slate-50/95 to-transparent
                        text-[11px] font-bold tracking-widest text-teal-600">
            تاریخچه پزشکی
          </p>

          <div className="flex flex-col gap-3 sm:max-h-[480px] sm:overflow-y-auto
                          sm:pl-0.5 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            {historyOrgans.length > 0 ? (
              historyOrgans.map((organKey) => (
                <HistoryCard
                  key={organKey}
                  organKey={organKey}
                  score={assessment.organRisks[organKey as keyof typeof assessment.organRisks]}
                  assessment={assessment}
                  config={config}
                />
              ))
            ) : (
              <p className="text-sm text-slate-400 py-4 text-center">تاریخچه‌ای موجود نیست.</p>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
