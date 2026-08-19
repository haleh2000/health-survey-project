// src/design-system/illustrations/anatomy/organ-assets.ts
// ─────────────────────────────────────────────────────────────────────────────
// چیدمان تصاویر آناتومی روی بدن.
// مختصات در دستگاه BodyFigure است: viewBox "0 0 400 600"
// (تنهٔ پیکرهٔ مرد: x ≈ ۱۵۲..۲۴۶ و y ≈ ۱۱۶..۳۵۴ — مرکز x=۱۹۹)
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
      { href: `${BASE}/bronchi.png`, x: 181, y: 118, width: 36, height: 39, muted: true },
      { href: `${BASE}/lung.png`, x: 158, y: 134, width: 38, height: 64 },
      { href: `${BASE}/lung.png`, x: 202, y: 134, width: 38, height: 64, mirrored: true },
    ],
    halo: { x: 199, y: 166, r: 40 },
    anchor: { x: 160, y: 160 },
    side: 'left',
  },
  {
    key: 'metabolic',
    label: 'متابولیک',
    layers: [
      { href: `${BASE}/kidney.png`, x: 158, y: 253, width: 19, height: 25, mirrored: true },
      { href: `${BASE}/kidney.png`, x: 223, y: 253, width: 19, height: 25 },
    ],
    halo: { x: 232, y: 265, r: 17 },
    anchor: { x: 243, y: 258 },
    side: 'right',
  },
  {
    key: 'pancreas',
    label: 'پانکراس',
    layers: [{ href: `${BASE}/pancreas.png`, x: 171, y: 250, width: 56, height: 33 }],
    halo: { x: 199, y: 266, r: 26 },
    anchor: { x: 165, y: 268 },
    side: 'left',
  },
  {
    key: 'colon',
    label: 'روده بزرگ',
    layers: [
      { href: `${BASE}/intestine.png`, x: 176, y: 290, width: 52, height: 48, muted: true },
      { href: `${BASE}/colon.png`, x: 168, y: 268, width: 62, height: 80 },
    ],
    halo: { x: 199, y: 308, r: 38 },
    anchor: { x: 162, y: 318 },
    side: 'left',
  },
  {
    key: 'liver',
    label: 'کبد',
    layers: [{ href: `${BASE}/liver.png`, x: 147, y: 206, width: 59, height: 46 }],
    halo: { x: 177, y: 229, r: 29 },
    anchor: { x: 155, y: 224 },
    side: 'left',
  },
  {
    key: 'gastric',
    label: 'معده و گوارش',
    layers: [{ href: `${BASE}/stomach.png`, x: 207, y: 208, width: 38, height: 39 }],
    halo: { x: 226, y: 228, r: 22 },
    anchor: { x: 242, y: 220 },
    side: 'right',
  },
  {
    key: 'cardiac',
    label: 'قلب و عروق',
    layers: [{ href: `${BASE}/heart.png`, x: 188, y: 157, width: 36, height: 47 }],
    halo: { x: 206, y: 181, r: 25 },
    anchor: { x: 230, y: 175 },
    side: 'right',
  },
  {
    key: 'stroke',
    label: 'مغز و اعصاب',
    layers: [{ href: `${BASE}/brain.png`, x: 181, y: 28, width: 36, height: 33 }],
    halo: { x: 199, y: 44, r: 20 },
    anchor: { x: 199, y: 26 },
    side: 'left',
  },
] as const;

/** آدرس همهٔ تصاویر — برای پیش‌بارگذاری */
export const ANATOMY_IMAGE_HREFS: readonly string[] = ORGAN_ASSETS.flatMap((asset) =>
  asset.layers.map((layer) => layer.href),
);
