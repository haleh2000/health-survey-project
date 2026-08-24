// src/modules/survey/presentation/components/report/report-blocks.tsx
// ─────────────────────────────────────────────────────────────────────────────
// اجزای سازندهٔ سند PDF.
//
// همهٔ این کامپوننت‌ها «ایستا» هستند: بدون انیمیشن، بدون تعامل و بدون وابستگی
// به تمِ اپ. دلیلش این است که سند در یک ظرفِ خارج از صفحه رندر و بلافاصله
// عکس‌برداری می‌شود؛ هر انیمیشنی یعنی احتمالِ گرفتنِ فریمِ نیمه‌تمام.
//
// هیچ‌کدام از این بلوک‌ها ارتفاعِ ثابت ندارند؛ صفحه‌بندی در
// `HealthReportDocument` بر اساس ارتفاع واقعیِ اندازه‌گیری‌شده انجام می‌شود.
// ─────────────────────────────────────────────────────────────────────────────

import type { CSSProperties, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { toPersianDigits } from "@core/text/digits";
import { BodyFigure } from "@ds/illustrations/anatomy/BodyFigure";
import {
  computeBodyShape,
  HEAD_ORGAN_KEYS,
  type BodyProfile,
} from "@ds/illustrations/anatomy/body-shape";
import { ORGAN_ASSETS } from "@ds/illustrations/anatomy/organ-assets";
import type { OrganKey } from "@survey/presentation/components/dashboard/organ-meta";
import { severityOf } from "@survey/presentation/components/dashboard/organ-meta";

import { C, cardStyle, CONTENT_WIDTH } from "./report-theme";

// ─── اجزای کوچک ─────────────────────────────────────────────────────────────

export function Chip({
  text,
  color,
  background,
}: {
  readonly text: string;
  readonly color: string;
  readonly background: string;
}) {
  return (
    <span
      style={{
        display: "inline-block",
        borderRadius: 999,
        padding: "3px 10px 5px",
        fontSize: 11,
        fontWeight: 700,
        color,
        background,
        lineHeight: 1.2,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </span>
  );
}

export function ProgressBar({
  percent,
  color,
  height = 8,
}: {
  readonly percent: number;
  readonly color: string;
  readonly height?: number;
}) {
  return (
    <div
      style={{
        flex: 1,
        height,
        borderRadius: 999,
        background: C.surfaceMuted,
        overflow: "hidden",
      }}
    >
      <div style={{ width: `${Math.max(percent, 2)}%`, height: "100%", background: color, borderRadius: 999 }} />
    </div>
  );
}

/** عنوان یک بخش — همیشه با بلوکِ بعدیِ خودش روی یک صفحه می‌ماند. */
export function SectionTitle({ title, hint }: { readonly title: string; readonly hint?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 8, paddingTop: 4 }}>
      <span style={{ width: 4, height: 16, borderRadius: 2, background: C.brand, display: "inline-block" }} />
      <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: C.ink }}>{title}</h2>
      {hint && <span style={{ fontSize: 10.5, color: C.inkSubtle }}>{hint}</span>}
    </div>
  );
}

export function Card({ children, style }: { readonly children: ReactNode; readonly style?: CSSProperties }) {
  return <div style={{ ...cardStyle, ...style }}>{children}</div>;
}

// ─── جلد ────────────────────────────────────────────────────────────────────

export interface CoverInfo {
  readonly logoSrc: string;
  readonly fullName: string;
  readonly nationalId: string;
  readonly ageLabel: string;
  readonly dateLabel: string;
  readonly assessmentCountLabel: string;
  readonly levelLabel: string;
  readonly scoreLabel: string;
  readonly tierColor: string;
  readonly tierBackground: string;
  readonly summary: string;
  readonly advice: string;
}

export function CoverBlock(info: CoverInfo) {
  const rows: readonly { label: string; value: string }[] = [
    { label: "نام و نام خانوادگی", value: info.fullName },
    { label: "کد ملی", value: info.nationalId },
    { label: "سن", value: info.ageLabel },
    { label: "تاریخ ارزیابی", value: info.dateLabel },
    { label: "تعداد ارزیابی‌ها", value: info.assessmentCountLabel },
  ];

  return (
    /*
      جلد یک گروهِ به‌هم‌چسبیده است که در ارتفاعِ صفحه وسط‌چین می‌شود، نه سه تکهٔ
      جدا با `space-between`. آن حالت، فضای خالیِ صفحه را وسطِ محتوا پخش می‌کرد و
      بینِ عنوان و کارتِ مشخصات یک شکافِ بزرگِ بی‌دلیل می‌ساخت.
    */
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 22,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <img src={info.logoSrc} alt="" style={{ width: 210, objectFit: "contain" }} />
          <div style={{ height: 3, width: 60, borderRadius: 999, background: C.brand, marginTop: 4 }} />
          <h1 style={{ margin: "10px 0 0", fontSize: 30, fontWeight: 900, color: C.ink }}>گزارش سلامت فردی</h1>
          <p style={{ margin: 0, fontSize: 13, color: C.inkMuted }}>
            خلاصهٔ ارزیابی خطر، نقشهٔ اندام‌ها و برنامهٔ پیشنهادی
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{
              ...cardStyle,
              background: C.surfaceSoft,
              padding: 18,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {rows.map((row) => (
              <div
                key={row.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  borderBottom: `1px dashed ${C.line}`,
                  paddingBottom: 8,
                  fontSize: 12.5,
                }}
              >
                <span style={{ color: C.inkSubtle }}>{row.label}</span>
                <span style={{ color: C.ink, fontWeight: 700 }}>{row.value}</span>
              </div>
            ))}
            {/* <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12.5 }}>
              <span style={{ color: C.inkSubtle }}>سطح کلی خطر</span>
              <span style={{ display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
                <Chip text={info.levelLabel} color={info.tierColor} background={info.tierBackground} />
                <span style={{ color: C.ink, fontWeight: 700 }}>{info.scoreLabel}</span>
              </span>
            </div> */}
          </div>

          <div style={{ ...cardStyle, borderRight: `4px solid ${info.tierColor}`, padding: 16 }}>
            <p style={{ margin: "0 0 6px", fontSize: 12.5, lineHeight: 2, color: C.ink }}>{info.summary}</p>
            <p style={{ margin: 0, fontSize: 12, lineHeight: 2, color: C.inkMuted }}>{info.advice}</p>
          </div>
        </div>
      </div>

      <p style={{ margin: "18px 0 0", fontSize: 10.5, lineHeight: 1.9, color: C.inkSubtle, textAlign: "center" }}>
        این گزارش بر پایهٔ پاسخ‌های خودِ شما تولید شده و ابزار غربالگری آموزشی است؛
        جایگزین معاینه، آزمایش یا تشخیص پزشک نیست.
      </p>
    </div>
  );
}

// ─── پروفایل ────────────────────────────────────────────────────────────────

export function BasicsBlock({
  items,
}: {
  readonly items: readonly { readonly label: string; readonly value: string }[];
}) {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      {items.map((item) => (
        <div
          key={item.label}
          style={{
            ...cardStyle,
            flex: 1,
            background: C.surfaceSoft,
            padding: "10px 12px",
            textAlign: "center",
          }}
        >
          <p style={{ margin: "0 0 4px", fontSize: 10.5, color: C.inkSubtle }}>{item.label}</p>
          <p style={{ margin: 0, fontSize: 13.5, fontWeight: 800, color: C.ink }}>{item.value}</p>
        </div>
      ))}
    </div>
  );
}

export function StatusGridBlock({
  statuses,
}: {
  readonly statuses: readonly {
    readonly title: string;
    readonly icon: LucideIcon;
    readonly flagged: boolean;
    readonly label: string;
  }[];
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
      {statuses.map((status) => {
        const Icon = status.icon;
        const tone = status.flagged ? C.warn : C.good;
        const toneSoft = status.flagged ? C.warnSoft : C.goodSoft;
        return (
          <div
            key={status.title}
            style={{
              ...cardStyle,
              width: (CONTENT_WIDTH - 20) / 3,
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
            }}
          >
            <span
              style={{
                width: 30,
                height: 30,
                borderRadius: 999,
                background: toneSoft,
                color: tone,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon width={16} height={16} />
            </span>
            <span style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 11.5, fontWeight: 700, color: C.ink }}>{status.title}</p>
              <p style={{ margin: 0, fontSize: 10.5, color: tone }}>{status.label}</p>
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function NoticeBlock({
  text,
  tone,
}: {
  readonly text: string;
  readonly tone: "good" | "warn" | "info";
}) {
  const map = {
    good: { color: C.good, background: C.goodSoft },
    warn: { color: C.warn, background: C.warnSoft },
    info: { color: C.brandDark, background: C.brandSoft },
  } as const;
  const { color, background } = map[tone];
  return (
    <p
      style={{
        margin: 0,
        borderRadius: 12,
        background,
        color,
        padding: "10px 14px",
        fontSize: 11.5,
        fontWeight: 700,
        textAlign: "center",
      }}
    >
      {text}
    </p>
  );
}

// ─── نقشهٔ اندام‌ها ──────────────────────────────────────────────────────────

const LEGEND: readonly { label: string; hex: string }[] = [
  { label: "نیاز به توجه فوری", hex: "#dc2626" },
  { label: "نیاز به پیگیری", hex: "#ea580c" },
  { label: "قابل بهبود", hex: "#ca8a04" },
  { label: "مطلوب", hex: "#0d9488" },
];

/**
 * نسخهٔ ایستای نقشهٔ بدن: همان تصاویر آناتومی، بدون انیمیشن و بدون خط‌های
 * اتصال (خط‌ها در PDF معنا ندارند چون کارت‌ها زیرِ نقشه چیده می‌شوند).
 */
export function AnatomyBlock({
  percents,
  profile,
  height = 430,
}: {
  readonly percents: Partial<Record<OrganKey, number>>;
  /** همان پیکره‌ای که کاربر در داشبورد دیده است. */
  readonly profile?: BodyProfile;
  readonly height?: number;
}) {
  const shape = computeBodyShape(profile);

  return (
    <div style={{ ...cardStyle, display: "flex", gap: 16, alignItems: "center", padding: 16 }}>
      {/*
        قابِ تصویر همان قابِ کاملِ پیکره است (نه یک برشِ دستی)، وگرنه در خروجیِ
        چاپی نوکِ سر و کفِ پا می‌افتد بیرون. `preserveAspectRatio` هم تضمین
        می‌کند تصویر داخل کادر جا شود، نه اینکه لبه‌هایش بریده شود.
      */}
      <svg
        viewBox={shape.viewBox}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: height * (380 / 600), height, flexShrink: 0, overflow: "visible" }}
        role="img"
      >
        <BodyFigure shape={shape} />
        {ORGAN_ASSETS.map((asset) => {
          const percent = percents[asset.key];
          const active = percent != null;
          const severity = severityOf(percent ?? 0);
          const zoneTransform = HEAD_ORGAN_KEYS.has(asset.key)
            ? shape.headOrganTransform
            : shape.organTransform;
          return (
            <g
              key={asset.key}
              transform={zoneTransform}
              opacity={active ? 1 : 0.14}
              style={active ? undefined : { filter: "grayscale(1)" }}
            >
              {active && (
                <circle cx={asset.halo.x} cy={asset.halo.y} r={asset.halo.r} fill={severity.hex} opacity={0.16} />
              )}
              {asset.layers.map((layer, index) => {
                const centerX = layer.x + layer.width / 2;
                return (
                  <image
                    key={index}
                    href={layer.href}
                    x={layer.x}
                    y={layer.y}
                    width={layer.width}
                    height={layer.height}
                    preserveAspectRatio="xMidYMid meet"
                    opacity={layer.muted ? 0.65 : 1}
                    transform={layer.mirrored ? `translate(${centerX * 2}, 0) scale(-1, 1)` : undefined}
                  />
                );
              })}
              {active && (
                <circle cx={asset.anchor.x} cy={asset.anchor.y} r={4} fill={severity.hex} stroke="#fff" strokeWidth={1.5} />
              )}
            </g>
          );
        })}
      </svg>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        <p style={{ margin: 0, fontSize: 11.5, lineHeight: 2, color: C.inkMuted }}>
          رنگ هر اندام روی نقشه، شدتِ عوامل خطرِ مرتبط با همان اندام را نشان می‌دهد.
          فهرست کامل با درصد و اولویت، در جدول زیر آمده است.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {LEGEND.map((item) => (
            <span key={item.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: C.inkMuted }}>
              <span style={{ width: 10, height: 10, borderRadius: 999, background: item.hex, display: "inline-block" }} />
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export interface OrganRow {
  readonly key: OrganKey;
  readonly label: string;
  readonly percent: number;
  readonly driverLabel: string;
}

export function OrganTableBlock({ rows }: { readonly rows: readonly OrganRow[] }) {
  return (
    <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: C.surfaceMuted,
          padding: "9px 14px",
          fontSize: 10.5,
          fontWeight: 700,
          color: C.inkSubtle,
        }}
      >
        <span style={{ width: 26 }}>اولویت</span>
        <span style={{ width: 108 }}>اندام</span>
        <span style={{ flex: 1 }}>شدت</span>
        <span style={{ width: 42, textAlign: "left" }}>درصد</span>
        <span style={{ width: 150 }}>عوامل اصلی</span>
      </div>
      {rows.map((row, index) => {
        const severity = severityOf(row.percent);
        return (
          <div
            key={row.key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 14px",
              fontSize: 11.5,
              color: C.ink,
              borderTop: `1px solid ${C.lineSoft}`,
            }}
          >
            <span style={{ width: 26 }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 20,
                  height: 20,
                  borderRadius: 999,
                  background: severity.hex,
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 800,
                }}
              >
                {toPersianDigits(index + 1)}
              </span>
            </span>
            <span style={{ width: 108, fontWeight: 700 }}>{row.label}</span>
            <span style={{ flex: 1, display: "flex" }}>
              <ProgressBar percent={row.percent} color={severity.hex} height={7} />
            </span>
            <span style={{ width: 42, textAlign: "left", fontWeight: 700, color: severity.hex }}>
              {toPersianDigits(row.percent)}٪
            </span>
            <span style={{ width: 150, fontSize: 10.5, color: C.inkSubtle }}>{row.driverLabel}</span>
          </div>
        );
      })}
    </div>
  );
}

export function OrganDetailBlock({
  rank,
  label,
  percent,
  description,
  tips,
  warningSign,
}: {
  readonly rank: number;
  readonly label: string;
  readonly percent: number;
  readonly description: string;
  readonly tips: readonly string[];
  readonly warningSign: string;
}) {
  const severity = severityOf(percent);
  return (
    <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
      <div style={{ height: 3, background: severity.hex }} />
      <div style={{ padding: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 20,
              height: 20,
              borderRadius: 999,
              background: severity.hex,
              color: "#fff",
              fontSize: 10,
              fontWeight: 800,
            }}
          >
            {toPersianDigits(rank)}
          </span>
          <span style={{ fontSize: 13.5, fontWeight: 800, color: C.ink }}>{label}</span>
          <Chip text={severity.label} color={severity.hex} background={`${severity.hex}14`} />
          <span style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
            <ProgressBar percent={percent} color={severity.hex} height={7} />
            <span style={{ fontSize: 11.5, fontWeight: 800, color: severity.hex }}>
              {toPersianDigits(percent)}٪
            </span>
          </span>
        </div>

        <p style={{ margin: "0 0 8px", fontSize: 11.5, lineHeight: 2, color: C.inkMuted }}>{description}</p>

        <p style={{ margin: "0 0 5px", fontSize: 11, fontWeight: 800, color: C.ink }}>توصیه‌های سلامت</p>
        <ul style={{ margin: "0 0 10px", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
          {tips.map((tip) => (
            <li key={tip} style={{ display: "flex", gap: 7, fontSize: 11, lineHeight: 1.9, color: C.inkMuted }}>
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 999,
                  background: severity.hex,
                  marginTop: 7,
                  flexShrink: 0,
                  display: "inline-block",
                }}
              />
              <span>{tip}</span>
            </li>
          ))}
        </ul>

        <div style={{ borderRadius: 10, background: C.dangerSoft, padding: "8px 12px" }}>
          <p style={{ margin: "0 0 2px", fontSize: 10.5, fontWeight: 800, color: C.danger }}>علائم هشداردهنده</p>
          <p style={{ margin: 0, fontSize: 10.5, lineHeight: 1.9, color: C.danger }}>{warningSign}</p>
        </div>
      </div>
    </div>
  );
}

// ─── BMI ────────────────────────────────────────────────────────────────────

export interface BmiInfo {
  readonly bmi: number | null;
  readonly categoryLabel: string;
  readonly categoryHex: string;
  readonly markerPercent: number;
  readonly ranges: readonly { readonly label: string; readonly range: string; readonly hex: string; readonly width: number }[];
  readonly healthyWeightLabel: string | null;
  readonly currentWeightLabel: string | null;
  readonly deltaLabel: string | null;
}

export function BmiBlock(info: BmiInfo) {
  return (
    <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: 14, padding: 16 }}>
      {info.bmi == null ? (
        <p style={{ margin: 0, fontSize: 11.5, color: C.inkSubtle }}>
          شاخص توده بدنی برای این ارزیابی ثبت نشده است.
        </p>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 92,
                height: 92,
                borderRadius: 999,
                border: `6px solid ${info.categoryHex}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 22, fontWeight: 900, color: C.ink }}>
                {toPersianDigits(info.bmi.toFixed(1))}
              </span>
              <span style={{ fontSize: 9.5, color: C.inkSubtle }}>BMI</span>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              <Chip text={info.categoryLabel} color={info.categoryHex} background={`${info.categoryHex}18`} />
              {info.currentWeightLabel && (
                <p style={{ margin: 0, fontSize: 11.5, color: C.inkMuted }}>
                  وزن فعلی: <b style={{ color: C.ink }}>{info.currentWeightLabel}</b>
                </p>
              )}
              {info.healthyWeightLabel && (
                <p style={{ margin: 0, fontSize: 11.5, color: C.inkMuted }}>
                  بازهٔ وزن سالم برای قد شما: <b style={{ color: C.ink }}>{info.healthyWeightLabel}</b>
                </p>
              )}
              {info.deltaLabel && (
                <p style={{ margin: 0, fontSize: 11.5, fontWeight: 700, color: info.categoryHex }}>{info.deltaLabel}</p>
              )}
            </div>
          </div>

          <div>
            <div style={{ position: "relative", height: 26, marginBottom: 6 }}>
              <span
                style={{
                  position: "absolute",
                  right: `${info.markerPercent}%`,
                  transform: "translateX(50%)",
                  background: info.categoryHex,
                  color: "#fff",
                  fontSize: 10.5,
                  fontWeight: 800,
                  borderRadius: 8,
                  padding: "2px 8px 4px",
                  whiteSpace: "nowrap",
                }}
              >
                {toPersianDigits(info.bmi.toFixed(1))}
              </span>
            </div>
            <div style={{ display: "flex", height: 14, borderRadius: 999, overflow: "hidden" }}>
              {info.ranges.map((range) => (
                <div
                  key={range.label}
                  style={{
                    width: `${range.width}%`,
                    background: range.hex,
                    opacity: range.label === "نرمال" ? 1 : 0.3,
                  }}
                />
              ))}
            </div>
            <div style={{ display: "flex", marginTop: 6 }}>
              {info.ranges.map((range) => (
                <div key={range.label} style={{ width: `${range.width}%`, textAlign: "center" }}>
                  <p style={{ margin: 0, fontSize: 9.5, fontWeight: 700, color: C.ink }}>{range.label}</p>
                  <p style={{ margin: 0, fontSize: 9, color: C.inkSubtle }}>{range.range}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── استوری‌های پیشنهاد روزانه ───────────────────────────────────────────────

export function StoryBlock({
  index,
  total,
  title,
  body,
  image,
  icon: Icon,
}: {
  readonly index: number;
  readonly total: number;
  readonly title: string;
  readonly body: string;
  readonly image: string;
  readonly icon: LucideIcon;
}) {
  return (
    <div style={{ ...cardStyle, display: "flex", gap: 12, padding: 12, alignItems: "flex-start" }}>
      {/*
        تصویرهای استوری نسبت‌های خیلی متفاوتی دارند (از تقریباً مربع تا بنرِ
        پهن). با `cover` هر بار بخشی از تصویر بیرونِ کادر می‌افتاد؛ `contain`
        داخلِ یک کادرِ کمی پهن‌تر، کلِ تصویر را نشان می‌دهد و جای خالی هم
        عمداً با پس‌زمینهٔ ملایم پر می‌شود تا کادر خالی به نظر نرسد.
      */}
      <div
        style={{
          width: 128,
          height: 96,
          borderRadius: 12,
          background: C.surfaceMuted,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <img
          src={image}
          alt=""
          style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", display: "block" }}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
          <span
            style={{
              width: 24,
              height: 24,
              borderRadius: 999,
              background: C.brandSoft,
              color: C.brandDark,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon width={14} height={14} />
          </span>
          <span style={{ fontSize: 12.5, fontWeight: 800, color: C.ink }}>{title}</span>
          <span style={{ marginRight: "auto", fontSize: 10, color: C.inkSubtle }}>
            {toPersianDigits(index)} از {toPersianDigits(total)}
          </span>
        </div>
        <p style={{ margin: 0, fontSize: 11.5, lineHeight: 2, color: C.inkMuted }}>{body}</p>
      </div>
    </div>
  );
}

export function DisclaimerBlock() {
  return (
    <div style={{ ...cardStyle, background: C.surfaceSoft, padding: 16 }}>
      <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 800, color: C.ink }}>یادداشت مهم</p>
      <p style={{ margin: 0, fontSize: 11, lineHeight: 2, color: C.inkMuted }}>
        این گزارش یک ابزار غربالگری آموزشی است و بر پایهٔ پاسخ‌های خوداظهاری شما تولید شده است.
        نتایج آن تشخیص پزشکی نیست و نباید مبنای شروع، تغییر یا قطع درمان قرار گیرد.
        برای تفسیر دقیق، این گزارش را همراه سوابق و آزمایش‌های خود به پزشک نشان دهید.
        در صورت مشاهدهٔ هر یک از «علائم هشداردهنده»، بدون تأخیر به پزشک مراجعه کنید.
      </p>
    </div>
  );
}
