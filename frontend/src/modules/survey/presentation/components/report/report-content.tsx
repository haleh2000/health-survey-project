// src/modules/survey/presentation/components/report/report-content.tsx
// ─────────────────────────────────────────────────────────────────────────────
// تبدیل «دادهٔ ارزیابی» به فهرستِ بلوک‌های سند.
//
// هر بلوک یک واحدِ تقسیم‌ناپذیر است: صفحه‌بند اجازه ندارد وسطش را ببرد. پس هر
// چیزی که نباید نصف شود (یک کارت اندام، یک استوری، یک ردیف جدول) باید یک بلوک
// باشد. عنوان بخش‌ها با `keepWithNext` به بلوکِ بعدی چسبیده‌اند تا عنوان تنها
// در انتهای صفحه جا نماند.
// ─────────────────────────────────────────────────────────────────────────────

import type { ReactNode } from "react";

import logoSrc from "@assets/day-daydar-lockup.png";
import { JALALI_MONTH_NAMES, parseJalaliIso } from "@core/date/jalali";
import { toPersianDigits } from "@core/text/digits";
import {
  adviceFor,
  summaryFor,
  type RiskAssessment,
  type RiskTier,
} from "@survey/domain/entities/risk-assessment.entity";
import type { AssessmentRecord } from "@survey/infrastructure/storage/assessment-history.storage";
import { BMI_RANGES, bmiCategory } from "@survey/presentation/components/dashboard/BmiGauge";
import {
  ORGAN_CONTENT,
  ORGAN_META,
  organPercent,
  type OrganKey,
} from "@survey/presentation/components/dashboard/organ-meta";
import { rankStatuses } from "@survey/presentation/components/dashboard/profile-status";
import {
  storyGroupsFor,
  type StorySlide,
} from "@survey/presentation/components/dashboard/recommendationStories";
import {
  CATEGORY_FALLBACK_IMAGE,
  STORY_IMAGES,
} from "@survey/presentation/components/dashboard/story-images";

import {
  AnatomyBlock,
  BasicsBlock,
  BmiBlock,
  CoverBlock,
  DisclaimerBlock,
  NoticeBlock,
  OrganDetailBlock,
  OrganTableBlock,
  SectionTitle,
  StatusGridBlock,
  StoryBlock,
  type OrganRow,
} from "./report-blocks";

/** یک واحد تقسیم‌ناپذیر از محتوای سند. */
export interface ReportBlock {
  readonly id: string;
  readonly node: ReactNode;
  /** پیش از این بلوک، صفحهٔ تازه باز شود. */
  readonly breakBefore?: boolean;
  /** این بلوک باید با بلوک بعدی روی یک صفحه بماند (عنوان بخش). */
  readonly keepWithNext?: boolean;
  /** بلوکِ تمام‌صفحه، بدون سربرگ و پاورقی (جلد). */
  readonly fullPage?: boolean;
}

export interface ReportMeta {
  readonly title: string;
  readonly personName: string;
  readonly dateLabel: string;
}

const readableJalali = (iso: string): string => {
  const parts = parseJalaliIso(iso);
  if (!parts) return iso;
  return `${toPersianDigits(parts.day)} ${JALALI_MONTH_NAMES[parts.month - 1]} ${toPersianDigits(parts.year)}`;
};

const TIER_TONE: Record<RiskTier, { readonly color: string; readonly background: string }> = {
  low: { color: "#0d9488", background: "#e7f6f4" },
  moderate: { color: "#ca8a04", background: "#fdf6e3" },
  elevated: { color: "#ea580c", background: "#fdeee4" },
  critical: { color: "#dc2626", background: "#fdecec" },
};

/** بازهٔ سالم BMI — همان چیزی که در نمودار داشبورد استفاده می‌شود. */
const HEALTHY_MIN = 18.5;
const HEALTHY_MAX = 24.9;
const AXIS_MIN = 15;
const AXIS_MAX = 40;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const storyImageOf = (slide: StorySlide, groupKey: keyof typeof CATEGORY_FALLBACK_IMAGE): string =>
  slide.image ?? STORY_IMAGES[slide.id] ?? CATEGORY_FALLBACK_IMAGE[groupKey];

/** بلوک‌های سند برای یک ارزیابی. */
export function buildReportBlocks(
  record: AssessmentRecord | null,
  history: readonly AssessmentRecord[],
): { readonly blocks: readonly ReportBlock[]; readonly meta: ReportMeta } {
  const assessment: RiskAssessment | null = record?.assessment ?? null;
  const blocks: ReportBlock[] = [];

  const dateLabel = record ? readableJalali(record.completedOnJalali) : "—";
  const tone = TIER_TONE[assessment?.tier ?? "low"];

  // ── جلد ───────────────────────────────────────────────────────────────────
  blocks.push({
    id: "cover",
    fullPage: true,
    node: (
      <CoverBlock
        logoSrc={logoSrc}
        fullName={assessment?.fullName ?? "کاربر دی‌دار"}
        nationalId={assessment ? toPersianDigits(assessment.nationalId) : "—"}
        ageLabel={assessment ? `${toPersianDigits(assessment.ageYears)} سال` : "—"}
        dateLabel={dateLabel}
        assessmentCountLabel={`${toPersianDigits(history.length)} ارزیابی`}
        levelLabel={assessment?.levelLabel ?? "—"}
        scoreLabel={assessment ? `امتیاز ${toPersianDigits(assessment.score)}` : ""}
        tierColor={tone.color}
        tierBackground={tone.background}
        summary={assessment ? summaryFor(assessment) : "هنوز ارزیابی‌ای ثبت نشده است."}
        advice={assessment ? adviceFor(assessment) : ""}
      />
    ),
  });

  // ── مشخصات و سوابق ────────────────────────────────────────────────────────
  blocks.push({
    id: "profile-title",
    keepWithNext: true,
    node: <SectionTitle title="مشخصات و وضعیت پایه" hint="بر اساس پاسخ‌های همین ارزیابی" />,
  });

  blocks.push({
    id: "profile-basics",
    node: (
      <BasicsBlock
        items={[
          { label: "سن", value: assessment ? `${toPersianDigits(assessment.ageYears)} سال` : "—" },
          { label: "قد", value: record?.heightCm ? `${toPersianDigits(record.heightCm)} سانتی‌متر` : "—" },
          { label: "وزن", value: record?.weightKg ? `${toPersianDigits(record.weightKg)} کیلوگرم` : "—" },
          { label: "BMI", value: assessment?.bmi != null ? toPersianDigits(assessment.bmi.toFixed(1)) : "—" },
          { label: "سطح خطر", value: assessment?.levelLabel ?? "—" },
        ]}
      />
    ),
  });

  if (assessment) {
    const ranked = rankStatuses(assessment.flags);
    const flaggedCount = ranked.filter((status) => status.fired > 0).length;

    blocks.push({
      id: "profile-statuses",
      node: (
        <StatusGridBlock
          statuses={ranked.map(({ item, fired }) => ({
            title: item.title,
            icon: item.icon,
            flagged: fired > 0,
            label: fired > 0 ? item.badLabel : item.goodLabel,
          }))}
        />
      ),
    });

    blocks.push({
      id: "profile-notice",
      node: (
        <NoticeBlock
          tone={flaggedCount > 0 ? "warn" : "good"}
          text={
            flaggedCount > 0
              ? `${toPersianDigits(flaggedCount)} حوزه نیاز به پیگیری دارد`
              : "همهٔ حوزه‌ها در محدودهٔ مطلوب است"
          }
        />
      ),
    });
  }

  // ── نقشهٔ اندام‌ها ─────────────────────────────────────────────────────────
  const rankedOrgans = assessment
    ? ORGAN_META.map((meta) => ({
        key: meta.key as OrganKey,
        label: meta.label,
        driverLabel: meta.driverLabel,
        percent: organPercent(assessment.organRisks, meta),
      })).sort((a, b) => b.percent - a.percent)
    : [];

  if (rankedOrgans.length > 0) {
    const percents: Partial<Record<OrganKey, number>> = Object.fromEntries(
      rankedOrgans.map((organ) => [organ.key, organ.percent]),
    );

    blocks.push({
      id: "organs-title",
      keepWithNext: true,
      node: <SectionTitle title="نقشهٔ سلامت اندام‌ها" hint="مرتب‌شده از بیشترین به کمترین نیاز به پیگیری" />,
    });

    blocks.push({ id: "organs-figure", node: <AnatomyBlock percents={percents} /> });

    blocks.push({
      id: "organs-table",
      node: <OrganTableBlock rows={rankedOrgans as readonly OrganRow[]} />,
    });

    blocks.push({
      id: "organ-details-title",
      keepWithNext: true,
      node: <SectionTitle title="جزئیات و توصیهٔ هر اندام" />,
    });

    rankedOrgans.forEach((organ, index) => {
      const content = ORGAN_CONTENT[organ.key];
      blocks.push({
        id: `organ-${organ.key}`,
        node: (
          <OrganDetailBlock
            rank={index + 1}
            label={organ.label}
            percent={organ.percent}
            description={content.description}
            tips={content.tips}
            warningSign={content.warningSign}
          />
        ),
      });
    });
  }

  // ── BMI ───────────────────────────────────────────────────────────────────
  const bmi = assessment?.bmi ?? null;
  const meters = record?.heightCm ? record.heightCm / 100 : null;
  const healthyMinKg = meters ? HEALTHY_MIN * meters * meters : null;
  const healthyMaxKg = meters ? HEALTHY_MAX * meters * meters : null;
  const currentKg = record?.weightKg ?? (meters && bmi ? bmi * meters * meters : null);
  const category = bmi != null ? bmiCategory(bmi) : null;

  const deltaLabel = (() => {
    if (currentKg == null || healthyMinKg == null || healthyMaxKg == null) return null;
    if (currentKg > healthyMaxKg) {
      return `حدود ${toPersianDigits((currentKg - healthyMaxKg).toFixed(1))} کیلوگرم بالاتر از بازهٔ سالم`;
    }
    if (currentKg < healthyMinKg) {
      return `حدود ${toPersianDigits((healthyMinKg - currentKg).toFixed(1))} کیلوگرم پایین‌تر از بازهٔ سالم`;
    }
    return "وزن شما در بازهٔ سالم قرار دارد";
  })();

  blocks.push({
    id: "bmi-title",
    keepWithNext: true,
    node: <SectionTitle title="شاخص توده بدنی (BMI)" hint="مقایسه با محدودهٔ نرمال" />,
  });

  blocks.push({
    id: "bmi",
    node: (
      <BmiBlock
        bmi={bmi}
        categoryLabel={category?.label ?? "—"}
        categoryHex={category?.hex ?? "#94a3b8"}
        markerPercent={
          bmi != null ? ((clamp(bmi, AXIS_MIN, AXIS_MAX) - AXIS_MIN) / (AXIS_MAX - AXIS_MIN)) * 100 : 0
        }
        ranges={BMI_RANGES.map((range) => ({
          label: range.label,
          range: range.range,
          hex: range.hex,
          width:
            ((Math.min(range.max, AXIS_MAX) - Math.max(range.min, AXIS_MIN)) / (AXIS_MAX - AXIS_MIN)) * 100,
        }))}
        healthyWeightLabel={
          healthyMinKg != null && healthyMaxKg != null
            ? `${toPersianDigits(healthyMinKg.toFixed(1))} تا ${toPersianDigits(healthyMaxKg.toFixed(1))} کیلوگرم`
            : null
        }
        currentWeightLabel={currentKg != null ? `${toPersianDigits(currentKg.toFixed(1))} کیلوگرم` : null}
        deltaLabel={deltaLabel}
      />
    ),
  });

  // ── پیشنهادهای روزانه (همهٔ استوری‌ها) ─────────────────────────────────────
  const groups = storyGroupsFor(assessment?.tier ?? null);

  blocks.push({
    id: "stories-title",
    keepWithNext: true,
    node: (
      <SectionTitle
        title="پیشنهادهای روزانه"
        hint="متنِ کاملِ همهٔ استوری‌های متناسب با وضعیت شما"
      />
    ),
  });

  groups.forEach((group) => {
    blocks.push({
      id: `story-group-${group.key}`,
      keepWithNext: true,
      node: (
        <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 2 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: "#0a8a92" }}>{group.label}</span>
          <span style={{ fontSize: 10.5, color: "#64748b" }}>
            {toPersianDigits(group.slides.length)} پیشنهاد
          </span>
        </div>
      ),
    });

    group.slides.forEach((slide, index) => {
      blocks.push({
        id: `story-${group.key}-${slide.id}`,
        node: (
          <StoryBlock
            index={index + 1}
            total={group.slides.length}
            title={slide.title}
            body={slide.body}
            image={storyImageOf(slide, group.key)}
            icon={slide.icon}
          />
        ),
      });
    });
  });

  // ── یادداشت پایانی ────────────────────────────────────────────────────────
  blocks.push({ id: "disclaimer", node: <DisclaimerBlock /> });

  return {
    blocks,
    meta: {
      title: "گزارش سلامت فردی",
      personName: assessment?.fullName ?? "کاربر دی‌دار",
      dateLabel,
    },
  };
}
