/**
 * The scored result returned by the backend.
 *
 * `tier` is the stable, machine-readable form the UI switches on; `levelLabel`
 * is the backend's own wording, shown verbatim so the clinical phrasing stays
 * under the backend's control. Mapping one to the other belongs to the
 * infrastructure layer, because only it knows the backend's exact strings.
 */

export const RiskTier = {
  Low: "low",
  Moderate: "moderate",
  Elevated: "elevated",
  Critical: "critical",
} as const;

export type RiskTier = (typeof RiskTier)[keyof typeof RiskTier];

/** Ordered from least to most severe — used for the result meter. */
export const RISK_TIER_ORDER: readonly RiskTier[] = [
  RiskTier.Low,
  RiskTier.Moderate,
  RiskTier.Elevated,
  RiskTier.Critical,
];

export const RISK_TIER_SUMMARY: Record<RiskTier, string> = {
  low: "بر اساس پاسخ‌های شما، عوامل خطر شناسایی‌شده در محدوده پایین قرار دارد.",
  moderate:
    "الگوی سبک زندگی شما در بلندمدت می‌تواند خطر بیماری‌های مزمن را افزایش دهد.",
  elevated:
    "ترکیبی از عوامل خطر قابل توجه در پاسخ‌های شما دیده می‌شود که نیازمند پیگیری است.",
  critical:
    "پاسخ‌های شما شامل سابقه بالینی مهم یا مجموعه‌ای از عوامل خطر پرشمار است.",
};

export const RISK_TIER_ADVICE: Record<RiskTier, string> = {
  low: "ادامه سبک زندگی سالم و انجام معاینات دوره‌ای سالانه توصیه می‌شود.",
  moderate:
    "اصلاح تغذیه، افزایش فعالیت بدنی و بررسی دوره‌ای شاخص‌های سلامت توصیه می‌شود.",
  elevated:
    "مشورت با پزشک برای برنامه غربالگری متناسب با عوامل خطر شما توصیه می‌شود.",
  critical:
    "مراجعه به پزشک برای ارزیابی بالینی در اولویت قرار دارد. این نتیجه جایگزین تشخیص پزشکی نیست.",
};

export interface RiskAssessment {
  readonly fullName: string;
  readonly nationalId: string;
  readonly ageYears: number;
  readonly score: number;
  /** The backend's own label, e.g. "گروه ۲: لبه خطر بلند مدت …". */
  readonly levelLabel: string;
  readonly tier: RiskTier;
}

export const summaryFor = (assessment: RiskAssessment): string =>
  RISK_TIER_SUMMARY[assessment.tier];

export const adviceFor = (assessment: RiskAssessment): string =>
  RISK_TIER_ADVICE[assessment.tier];
