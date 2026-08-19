// src/design-system/illustrations/anatomy/organ-assets.ts
// ─────────────────────────────────────────────────────────────────────────────
// چیدمان تصاویر آناتومی روی بدن.
// مختصات در دستگاه BodyFigure است: viewBox "0 0 400 600"
// (تنهٔ پیکرهٔ جدید: x ≈ ۱۶۰..۲۴۰ و y ≈ ۱۱۲..۳۴۳ — مرکز x=۲۰۰)
//
// تصاویر: Servier Medical Art — CC BY 4.0 (به ATTRIBUTION.md در پوشهٔ تصاویر
// نگاه کنید؛ ذکر منبع در رابط کاربری الزامی است).
// ─────────────────────────────────────────────────────────────────────────────
import type { OrganKey } from '@survey/presentation/components/dashboard/organ-meta';

const BASE = '/anatomy/servier';

/** یک تصویر منفرد داخل یک ارگان (مثلاً هر ریه یا هر کلیه) */
export interface OrganLayer {
  readonly href: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  /** قرینه‌سازی افقی حول مرکز خودِ تصویر (برای ساخت عضو سمت مقابل) */
  readonly mirrored?: boolean;
  /** لایه‌های کمکی که پشت عضو اصلی می‌نشینند (برونش‌ها، رودهٔ باریک) */
  readonly muted?: boolean;
}

export interface OrganAsset {
  readonly key: OrganKey;
  readonly label: string;
  readonly layers: readonly OrganLayer[];
  /** مرکز هالهٔ رنگی ریسک */
  readonly halo: { x: number; y: number; r: number };
  /** نقطهٔ اتصال خط راهنما به کارت */
  readonly anchor: { x: number; y: number };
  readonly side: 'left' | 'right';
}

/**
 * ترتیب آرایه = ترتیب رسم (عقب به جلو).
 * ریه‌ها پشت قلب، پانکراس پشت معده، رودهٔ باریک پشت رودهٔ بزرگ.
 */
export const ORGAN_ASSETS: readonly OrganAsset[] = [
  {
    key: 'lung',
    label: 'ریه‌ها',
    layers: [
      { href: `${BASE}/bronchi.png`, x: 183, y: 131, width: 34, height: 37, muted: true },
      { href: `${BASE}/lung.png`, x: 166, y: 138, width: 34, height: 57 },
      { href: `${BASE}/lung.png`, x: 200, y: 138, width: 34, height: 57, mirrored: true },
    ],
    halo: { x: 200, y: 171, r: 38 },
    anchor: { x: 168, y: 161 },
    side: 'left',
  },
  {
    key: 'metabolic',
    label: 'متابولیک',
    layers: [
      { href: `${BASE}/kidney.png`, x: 164, y: 227, width: 18, height: 24, mirrored: true },
      { href: `${BASE}/kidney.png`, x: 218, y: 227, width: 18, height: 24 },
    ],
    halo: { x: 227, y: 239, r: 16 },
    anchor: { x: 235, y: 232 },
    side: 'right',
  },
  {
    key: 'pancreas',
    label: 'پانکراس',
    layers: [{ href: `${BASE}/pancreas.png`, x: 172, y: 235, width: 55.4, height: 32.3 }],
    halo: { x: 199, y: 251, r: 25 },
    anchor: { x: 172, y: 254 },
    side: 'left',
  },
  {
    key: 'colon',
    label: 'روده بزرگ',
    layers: [
      { href: `${BASE}/intestine.png`, x: 175, y: 271, width: 50, height: 46, muted: true },
      { href: `${BASE}/colon.png`, x: 172, y: 243, width: 55.4, height: 76.6 },
    ],
    halo: { x: 199, y: 283, r: 37 },
    anchor: { x: 171, y: 293 },
    side: 'left',
  },
  {
    key: 'liver',
    label: 'کبد',
    layers: [{ href: `${BASE}/liver.png`, x: 157, y: 198.6, width: 64.7, height: 50.8 }],
    halo: { x: 185, y: 223, r: 28 },
    anchor: { x: 162, y: 217 },
    side: 'left',
  },
  {
    key: 'gastric',
    label: 'معده و گوارش',
    layers: [{ href: `${BASE}/stomach.png`, x: 197, y: 206, width: 38, height: 39 }],
    halo: { x: 216, y: 223, r: 22 },
    anchor: { x: 234, y: 215 },
    side: 'right',
  },
  {
    key: 'cardiac',
    label: 'قلب و عروق',
    layers: [{ href: `${BASE}/heart.png`, x: 191, y: 158, width: 34, height: 45 }],
    halo: { x: 208, y: 180, r: 24 },
    anchor: { x: 226, y: 173 },
    side: 'right',
  },
  {
    key: 'stroke',
    label: 'مغز و اعصاب',
    layers: [{ href: `${BASE}/brain.png`, x: 184, y: 27, width: 33, height: 30 }],
    halo: { x: 200, y: 42, r: 19 },
    anchor: { x: 200, y: 24 },
    side: 'left',
  },
] as const;

/** آدرس همهٔ تصاویر — برای پیش‌بارگذاری */
export const ANATOMY_IMAGE_HREFS: readonly string[] = ORGAN_ASSETS.flatMap((asset) =>
  asset.layers.map((layer) => layer.href),
);
