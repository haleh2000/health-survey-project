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
      { href: `${BASE}/bronchi.png`, x: 180, y: 114, width: 38, height: 40, muted: true },
      { href: `${BASE}/lung.png`, x: 157, y: 128, width: 40, height: 68 },
      { href: `${BASE}/lung.png`, x: 201, y: 128, width: 40, height: 68, mirrored: true },
    ],
    halo: { x: 199, y: 164, r: 38 },
    anchor: { x: 163, y: 158 },
    side: 'left',
  },
  {
    key: 'metabolic',
    label: 'متابولیک',
    layers: [
      { href: `${BASE}/kidney.png`, x: 159, y: 240, width: 20, height: 26, mirrored: true },
      { href: `${BASE}/kidney.png`, x: 220, y: 240, width: 20, height: 26 },
    ],
    halo: { x: 230, y: 254, r: 16 },
    anchor: { x: 240, y: 248 },
    side: 'right',
  },
  {
    key: 'pancreas',
    label: 'پانکراس',
    layers: [{ href: `${BASE}/pancreas.png`, x: 171, y: 236, width: 56, height: 33 }],
    halo: { x: 199, y: 254, r: 24 },
    anchor: { x: 167, y: 256 },
    side: 'left',
  },
  {
    key: 'colon',
    label: 'روده بزرگ',
    layers: [
      { href: `${BASE}/intestine.png`, x: 177, y: 272, width: 52, height: 48, muted: true },
      { href: `${BASE}/colon.png`, x: 167, y: 250, width: 64, height: 82 },
    ],
    halo: { x: 199, y: 293, r: 36 },
    anchor: { x: 164, y: 302 },
    side: 'left',
  },
  {
    key: 'liver',
    label: 'کبد',
    layers: [{ href: `${BASE}/liver.png`, x: 148, y: 194, width: 62, height: 48 }],
    halo: { x: 181, y: 218, r: 27 },
    anchor: { x: 158, y: 214 },
    side: 'left',
  },
  {
    key: 'gastric',
    label: 'معده و گوارش',
    layers: [{ href: `${BASE}/stomach.png`, x: 202, y: 196, width: 40, height: 41 }],
    halo: { x: 222, y: 218, r: 21 },
    anchor: { x: 239, y: 211 },
    side: 'right',
  },
  {
    key: 'cardiac',
    label: 'قلب و عروق',
    layers: [{ href: `${BASE}/heart.png`, x: 187, y: 152, width: 38, height: 50 }],
    halo: { x: 206, y: 179, r: 24 },
    anchor: { x: 228, y: 172 },
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
