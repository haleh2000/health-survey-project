// src/design-system/illustrations/anatomy/organ-assets.ts
// ─────────────────────────────────────────────────────────────────────────────
// چیدمان تصاویر آناتومی روی بدن.
// مختصات در همان دستگاه BodySilhouette است: viewBox "0 0 400 600"
// (تنه تقریباً x: ۱۰۶..۲۹۴ و y: ۱۰۸..۳۷۲)
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
      { href: `${BASE}/bronchi.png`, x: 172, y: 122, width: 56, height: 60, muted: true },
      { href: `${BASE}/lung.png`, x: 143, y: 126, width: 56, height: 94 },
      { href: `${BASE}/lung.png`, x: 201, y: 126, width: 56, height: 94, mirrored: true },
    ],
    halo: { x: 200, y: 178, r: 58 },
    anchor: { x: 150, y: 166 },
    side: 'left',
  },
  {
    key: 'metabolic',
    label: 'متابولیک',
    layers: [
      { href: `${BASE}/kidney.png`, x: 143, y: 240, width: 27, height: 36, mirrored: true },
      { href: `${BASE}/kidney.png`, x: 230, y: 240, width: 27, height: 36 },
    ],
    halo: { x: 243, y: 258, r: 24 },
    anchor: { x: 256, y: 250 },
    side: 'right',
  },
  {
    key: 'pancreas',
    label: 'پانکراس',
    layers: [{ href: `${BASE}/pancreas.png`, x: 158, y: 248, width: 84, height: 49 }],
    halo: { x: 198, y: 272, r: 38 },
    anchor: { x: 156, y: 276 },
    side: 'left',
  },
  {
    key: 'colon',
    label: 'روده بزرگ',
    layers: [
      { href: `${BASE}/intestine.png`, x: 162, y: 288, width: 76, height: 70, muted: true },
      { href: `${BASE}/colon.png`, x: 158, y: 250, width: 84, height: 116 },
    ],
    halo: { x: 199, y: 310, r: 56 },
    anchor: { x: 154, y: 322 },
    side: 'left',
  },
  {
    key: 'liver',
    label: 'کبد',
    layers: [{ href: `${BASE}/liver.png`, x: 134, y: 202, width: 98, height: 77 }],
    halo: { x: 176, y: 240, r: 42 },
    anchor: { x: 140, y: 232 },
    side: 'left',
  },
  {
    key: 'gastric',
    label: 'معده و گوارش',
    layers: [{ href: `${BASE}/stomach.png`, x: 196, y: 208, width: 60, height: 62 }],
    halo: { x: 226, y: 239, r: 34 },
    anchor: { x: 254, y: 230 },
    side: 'right',
  },
  {
    key: 'cardiac',
    label: 'قلب و عروق',
    layers: [{ href: `${BASE}/heart.png`, x: 186, y: 152, width: 55, height: 72 }],
    halo: { x: 213, y: 188, r: 36 },
    anchor: { x: 241, y: 180 },
    side: 'right',
  },
  {
    key: 'stroke',
    label: 'مغز و اعصاب',
    layers: [{ href: `${BASE}/brain.png`, x: 169, y: 12, width: 62, height: 56 }],
    halo: { x: 200, y: 40, r: 34 },
    anchor: { x: 200, y: 16 },
    side: 'left',
  },
] as const;

/** آدرس همهٔ تصاویر — برای پیش‌بارگذاری */
export const ANATOMY_IMAGE_HREFS: readonly string[] = ORGAN_ASSETS.flatMap((asset) =>
  asset.layers.map((layer) => layer.href),
);
