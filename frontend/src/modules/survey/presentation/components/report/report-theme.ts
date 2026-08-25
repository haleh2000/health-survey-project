// src/modules/survey/presentation/components/report/report-theme.ts
// ─────────────────────────────────────────────────────────────────────────────
// ثابت‌های «سند PDF».
//
// سند مستقل از تمِ اپ است: همیشه روشن، همیشه با همین رنگ‌ها و همین اندازه‌ها،
// تا خروجی چاپی قابل پیش‌بینی باشد. هیچ متغیر CSS اپ اینجا استفاده نمی‌شود.
//
// واحدها: pixel در چگالی ۹۶dpi — یعنی A4 دقیقاً ۷۹۴×۱۱۲۳ پیکسل.
// ─────────────────────────────────────────────────────────────────────────────

/** A4 در ۹۶dpi (۲۱۰×۲۹۷ میلی‌متر). */
export const PAGE_WIDTH_PX = 794;
export const PAGE_HEIGHT_PX = 1123;

/** A4 بر حسب میلی‌متر — همان چیزی که به jsPDF داده می‌شود. */
export const PAGE_WIDTH_MM = 210;
export const PAGE_HEIGHT_MM = 297;

/** حاشیهٔ چاپی سند. */
export const PAGE_PADDING_X = 48;
export const PAGE_PADDING_TOP = 20;
export const PAGE_PADDING_BOTTOM = 36;

/** ارتفاع نوار بالا و پایینِ هر صفحه (به‌جز جلد). */
export const HEADER_HEIGHT = 46;
export const FOOTER_HEIGHT = 34;

/** فاصلهٔ عمودی بین بلوک‌ها. */
export const BLOCK_GAP = 14;

/** پهنای ستون محتوا. */
export const CONTENT_WIDTH = PAGE_WIDTH_PX - PAGE_PADDING_X * 2;

/** ارتفاع قابل استفادهٔ محتوا در صفحات معمولی. */
export const CONTENT_HEIGHT =
  PAGE_HEIGHT_PX - PAGE_PADDING_TOP - PAGE_PADDING_BOTTOM - HEADER_HEIGHT - FOOTER_HEIGHT;

export const REPORT_FONT_STACK = '"Vazirmatn", "Tahoma", system-ui, sans-serif';

/** پالتِ چاپی سند. */
export const C = {
  ink: "#0f172a",
  inkMuted: "#475569",
  inkSubtle: "#64748b",
  line: "#e2e8f0",
  lineSoft: "#eef2f6",
  surface: "#ffffff",
  surfaceSoft: "#f8fafc",
  surfaceMuted: "#f1f5f9",
  brand: "#0fadb6",
  brandDark: "#0a8a92",
  brandSoft: "#e6f7f8",
  good: "#0d9488",
  goodSoft: "#e7f6f4",
  warn: "#ca8a04",
  warnSoft: "#fdf6e3",
  danger: "#dc2626",
  dangerSoft: "#fdecec",
} as const;

/** استایل پایهٔ کارت‌های سند. */
export const cardStyle = {
  border: `1px solid ${C.line}`,
  borderRadius: 14,
  background: C.surface,
  padding: 14,
} as const;
