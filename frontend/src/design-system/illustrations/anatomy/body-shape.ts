// src/design-system/illustrations/anatomy/body-shape.ts
// ─────────────────────────────────────────────────────────────────────────────
// موتورِ ریخت‌دهیِ پیکرهٔ انسان بر پایهٔ قد، وزن، سن و جنسیت.
//
// چرا این‌طور و نه «چند سیلوئت آماده»:
//   با چند تصویرِ از پیش‌آماده، پرش بین حالت‌ها دیده می‌شود و ترکیب‌ها
//   (مثلاً «کودکِ قدبلندِ لاغر») پوشش داده نمی‌شود. این‌جا در عوض همان سیلوئتِ
//   واقع‌گرایانهٔ مرجع «وارپ» می‌شود؛ پس همهٔ جزئیاتِ هنری (دست، پا، فک،
//   انحنای عضلات) سر جایش می‌ماند و فقط تناسب‌ها تغییر می‌کند.
//
// وارپ دو مؤلفه دارد:
//   • نگاشتِ عمودی  — جای نقاط کلیدی (تارک، چانه، شانه، کمر، لگن، فاق، زانو،
//     مچ، کف پا) بر اساس قد و سن جابه‌جا می‌شود. سنِ کم یعنی سرِ بزرگ‌تر و
//     پاهای کوتاه‌تر؛ دقیقاً همان چیزی که چشم، «بچه» می‌خواندش.
//   • نگاشتِ افقی — ضریب پهنا در هر ارتفاع، از BMI می‌آید. نکتهٔ ظریف: تنه که
//     پهن می‌شود نباید بازوها را هم کش بدهد، پس نگاشتِ افقی تکه‌ای است:
//     تا لبهٔ تنه با ضریبِ تنه، بیرونِ آن با ضریبِ اندام. گذرِ این دو ضریب روی
//     یک رمپِ هموار انجام می‌شود تا مشتقِ نگاشت پیوسته بماند و خطِ دور در
//     لبهٔ تنه «شکستگی» نیفتد. بازو هم کنارِ شکمِ بزرگ‌شده می‌رود، نه اینکه
//     با آن باد کند.
//
// خروجی همیشه داخلِ قابِ ثابتِ VIEW_BOX جا می‌شود (در صورت نیاز یک مقیاسِ
// یکنواختِ نهایی اعمال می‌شود)، تا هیچ‌جا — به‌ویژه در PDF — بریده نشود.
// ─────────────────────────────────────────────────────────────────────────────

import {
  coreHalfFrom,
  getBaseOutline,
  type BodySex,
} from "./body-base-path";

export type { BodySex };

export interface BodyProfile {
  readonly heightCm?: number | null;
  readonly weightKg?: number | null;
  readonly ageYears?: number | null;
  readonly sex?: BodySex | null;
}

export interface BodyShape {
  /** مسیر سیلوئت در دستگاه `VIEW_BOX`. */
  readonly bodyD: string;
  /** مسیر موی بلند — فقط برای پیکرهٔ زن، وگرنه `null`. */
  readonly hairD: string | null;
  /** قابِ ثابتی که همهٔ حالت‌ها داخل آن جا می‌شوند. */
  readonly viewBox: string;
  /** تبدیلی که اندام‌های تنه را با پیکرهٔ جدید هم‌راستا می‌کند. */
  readonly organTransform: string;
  /** تبدیلِ جداگانهٔ مغز، چون نسبتِ سر به بدن با سن عوض می‌شود. */
  readonly headOrganTransform: string;
}

// ─── قاب و مبدأ ──────────────────────────────────────────────────────────────

/** محورِ تقارنِ سیلوئت مرجع. */
const CENTER_X = 200;
/** خطِ زمین؛ کفِ پا همیشه این‌جا می‌نشیند تا پیکره‌ها هم‌تراز دیده شوند. */
const GROUND_Y = 594;

const FRAME_X = 10;
const FRAME_W = 380;
const FRAME_H = 600;

export const BODY_VIEW_BOX = `${FRAME_X} 0 ${FRAME_W} ${FRAME_H}`;

// ─── نقاط کلیدیِ سیلوئت مرجع (اندازه‌گیری‌شده روی رستر) ────────────────────

const REF = {
  crown: 6,
  chin: 72,
  shoulder: 104,
  chest: 200,
  waist: 250,
  hip: 310,
  crotch: 343,
  knee: 455,
  ankle: 548,
  sole: 595,
} as const;

const REF_HEIGHT = REF.sole - REF.crown; // ۵۸۹
const REF_HEAD = REF.chin - REF.crown; // ۶۶
/** نیم‌پهنای سر در پهن‌ترین جا. */
const REF_HEAD_HALF = 29;

/** ارتفاعِ ترسیمیِ یک بزرگسالِ ۱۷۵ سانتی‌متری؛ مبنای همهٔ مقیاس‌ها. */
const BASE_DRAW_HEIGHT = 545;

/** پنجرهٔ ارتفاعی‌ای که بازوها از تنه جدا دیده می‌شوند. */
const ARM_FADE_IN: readonly [number, number] = [168, 196];
const ARM_FADE_OUT: readonly [number, number] = [352, 384];

// ─── محدودهٔ اندام‌ها روی سیلوئت مرجع ────────────────────────────────────────
// (هم‌خوان با مختصاتِ organ-assets.ts)

/** بالا و پایینِ خوشهٔ اندام‌های تنه — از سرِ ریه‌ها تا تهِ رودهٔ بزرگ. */
const ORGAN_BAND = { top: 116, bottom: 332, centerX: 199 } as const;
/** نیم‌پهنای خوشهٔ اندام‌های تنه. */
const ORGAN_HALF = 47;
/** مرکز تصویرِ مغز روی سیلوئت مرجع. */
const BRAIN_CENTER = { x: 199, y: 44.5 } as const;

// ─── کمکی‌های عددی ───────────────────────────────────────────────────────────

const clamp = (value: number, min: number, max: number): number =>
  value < min ? min : value > max ? max : value;

/**
 * خواندنِ عضوِ آرایه به‌صورت عدد.
 * همهٔ اندیس‌های این فایل پیش از فراخوانی محدود شده‌اند؛ این کمکی فقط
 * `noUncheckedIndexedAccess` را از سر راه برمی‌دارد.
 */
const at = (values: readonly number[], index: number): number => values[index] as number;

/** هموارسازیِ smoothstep روی بازهٔ [a,b]. */
function smoothStep(value: number, a: number, b: number): number {
  const t = clamp((value - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}

/**
 * درون‌یابیِ هرمیتِ یکنوا (PCHIP).
 *
 * چرا نه خطی: نگاشتِ عمودیِ خطی در هر نقطهٔ کلیدی یک شکستگی می‌سازد که روی
 * سیلوئت به شکلِ «زانویِ» ناخواسته دیده می‌شود. PCHIP هموار است و — برخلاف
 * اسپلاین معمولی — بین دو نقطه بالا/پایین نمی‌زند، پس ترتیبِ اندام‌ها هرگز
 * به‌هم نمی‌ریزد.
 */
function makeMonotoneSpline(
  xs: readonly number[],
  ys: readonly number[],
): (x: number) => number {
  const n = xs.length;
  const slopes: number[] = [];
  for (let i = 0; i < n - 1; i += 1) {
    slopes.push((at(ys, i + 1) - at(ys, i)) / (at(xs, i + 1) - at(xs, i)));
  }

  const tangents: number[] = new Array<number>(n);
  tangents[0] = at(slopes, 0);
  tangents[n - 1] = at(slopes, n - 2);
  for (let i = 1; i < n - 1; i += 1) {
    const a = at(slopes, i - 1);
    const b = at(slopes, i);
    tangents[i] = a * b <= 0 ? 0 : (2 * a * b) / (a + b);
  }

  return (x: number): number => {
    if (x <= at(xs, 0)) return at(ys, 0) + at(tangents, 0) * (x - at(xs, 0));
    if (x >= at(xs, n - 1)) {
      return at(ys, n - 1) + at(tangents, n - 1) * (x - at(xs, n - 1));
    }

    let i = 0;
    while (i < n - 2 && x > at(xs, i + 1)) i += 1;

    const h = at(xs, i + 1) - at(xs, i);
    const t = (x - at(xs, i)) / h;
    const t2 = t * t;
    const t3 = t2 * t;

    return (
      at(ys, i) * (2 * t3 - 3 * t2 + 1) +
      at(tangents, i) * h * (t3 - 2 * t2 + t) +
      at(ys, i + 1) * (-2 * t3 + 3 * t2) +
      at(tangents, i + 1) * h * (t3 - t2)
    );
  };
}

/** چقدر در این ارتفاع باید بازو را از تنه جدا حساب کرد (۰ تا ۱). */
function armSeparationAt(y: number): number {
  return (
    smoothStep(y, ARM_FADE_IN[0], ARM_FADE_IN[1]) *
    (1 - smoothStep(y, ARM_FADE_OUT[0], ARM_FADE_OUT[1]))
  );
}

// ─── تفسیرِ پروفایل ──────────────────────────────────────────────────────────

/** میانهٔ BMI بر حسب سن — پایینِ سنین کودکی به‌مراتب کمتر از بزرگسالی است. */
const BMI_REFERENCE: readonly (readonly [number, number])[] = [
  [1, 17.2],
  [2, 16.4],
  [5, 15.4],
  [8, 15.9],
  [11, 17.0],
  [14, 19.2],
  [17, 20.9],
  [20, 21.7],
];

function referenceBmi(age: number): number {
  const ages = BMI_REFERENCE.map(([value]) => value);
  const values = BMI_REFERENCE.map(([, value]) => value);
  const last = ages.length - 1;

  if (age <= at(ages, 0)) return at(values, 0);
  if (age >= at(ages, last)) return at(values, last);

  for (let i = 0; i < last; i += 1) {
    const a = at(ages, i);
    const b = at(ages, i + 1);
    if (age <= b) {
      return at(values, i) + ((at(values, i + 1) - at(values, i)) * (age - a)) / (b - a);
    }
  }
  return at(values, last);
}

interface Metrics {
  /** ۰ = بزرگسال، ۱ = نوزاد. */
  readonly childness: number;
  /** ۰ تا ~۱٫۲ — چقدر بالاتر از BMI مرجعِ سن. */
  readonly plumpness: number;
  /** ۰ تا ۱ — چقدر پایین‌تر از BMI مرجعِ سن. */
  readonly leanness: number;
  readonly female: boolean;
  readonly drawHeight: number;
}

/** قدِ نوعی بر حسب سن — وقتی کاربر قد نداده باشد. */
function typicalHeight(age: number): number {
  if (age >= 18) return 172;
  if (age <= 1) return 76;
  // رشد تقریباً خطی از ۱ تا ۱۸ سالگی
  return 76 + ((172 - 76) * (age - 1)) / 17;
}

function readMetrics(profile: BodyProfile): Metrics {
  const rawAge = Number(profile.ageYears);
  const age = Number.isFinite(rawAge) ? clamp(rawAge, 0, 110) : 32;

  const rawHeight = Number(profile.heightCm);
  const heightCm = Number.isFinite(rawHeight) && rawHeight > 40
    ? clamp(rawHeight, 55, 230)
    : typicalHeight(age);

  const rawWeight = Number(profile.weightKg);
  const meters = heightCm / 100;
  const bmi = Number.isFinite(rawWeight) && rawWeight > 2
    ? clamp(rawWeight / (meters * meters), 9, 60)
    : referenceBmi(age);

  const delta = bmi - referenceBmi(age);

  return {
    childness: clamp((18 - age) / 18, 0, 1) ** 1.2,
    // سقفِ ۲٫۶ به‌جای ۱٫۲: با ضریب‌های متعادِلِ جدید، BMIهای خیلی بالا هم باید
    // همچنان چاق‌تر دیده شوند و در BMI ~۳۶ «قفل» نشوند.
    plumpness: clamp(delta / 12, 0, 2.6),
    leanness: clamp(-delta / 7.5, 0, 1),
    female: profile.sex === "female",
    // توانِ ۰٫۵ اختلافِ قدها را دیدنی نگه می‌دارد بی‌آنکه قدبلندها از قاب بزنند.
    drawHeight: clamp(BASE_DRAW_HEIGHT * (heightCm / 175) ** 0.5, 300, 592),
  };
}

// ─── ساختِ هندسه ─────────────────────────────────────────────────────────────

interface Geometry {
  readonly remapY: (y: number) => number;
  readonly coreScale: (y: number) => number;
  /** لبهٔ تنه (بدونِ بازو) روی سیلوئتِ مرجع — مرزِ «تنه» و «اندام». */
  readonly coreEdgeAt: (y: number) => number;
  /** مسیرِ مرجعِ تحلیل‌شدهٔ همان جنسیت. */
  readonly baseCommands: readonly Command[];
  readonly limbScale: number;
  readonly statureScale: number;
  readonly headScale: number;
  readonly landmarks: Record<keyof typeof REF, number>;
}

function buildGeometry(metrics: Metrics): Geometry {
  const { childness, plumpness, leanness, female, drawHeight } = metrics;

  const outline = getBaseOutline(female ? "female" : "male");
  const coreEdgeAt = (y: number): number => coreHalfFrom(outline.coreHalf, y);

  const statureScale = drawHeight / REF_HEIGHT;

  // ── نقاط کلیدیِ عمودی ──
  // سر نسبت به بدن: نوزاد ~۴ سر، بزرگسال ~۷٫۵ سر. سیلوئت مرجع سبکِ کشیده‌ای
  // دارد، پس نسبت‌ها به‌صورت ضریب روی خودِ مرجع اعمال می‌شوند نه مطلق.
  const headFraction = (REF_HEAD / REF_HEIGHT) * (1 + 0.55 * childness);
  // فاقِ پایین‌تر یعنی پای کوتاه‌تر — نشانهٔ اصلیِ اندامِ کودک.
  const crotchFraction = (REF.crotch - REF.crown) / REF_HEIGHT + 0.085 * childness;

  const crown = GROUND_Y - drawHeight;
  const chin = crown + drawHeight * headFraction;
  const crotch = crown + drawHeight * crotchFraction;
  const sole = GROUND_Y;

  const torsoSpan = REF.crotch - REF.chin;
  const legSpan = REF.sole - REF.crotch;
  const inTorso = (y: number) => chin + ((y - REF.chin) / torsoSpan) * (crotch - chin);
  const inLeg = (y: number) => crotch + ((y - REF.crotch) / legSpan) * (sole - crotch);

  const landmarks = {
    crown,
    chin,
    shoulder: inTorso(REF.shoulder),
    chest: inTorso(REF.chest),
    waist: inTorso(REF.waist),
    hip: inTorso(REF.hip),
    crotch,
    knee: inLeg(REF.knee),
    ankle: inLeg(REF.ankle),
    sole,
  };

  const remapY = makeMonotoneSpline(
    [REF.crown, REF.chin, REF.shoulder, REF.chest, REF.waist, REF.hip, REF.crotch, REF.knee, REF.ankle, REF.sole],
    [crown, chin, landmarks.shoulder, landmarks.chest, landmarks.waist, landmarks.hip, crotch, landmarks.knee, landmarks.ankle, sole],
  );

  // ── ضرایبِ پهنا ──
  // توزیعِ چاقی باید هماهنگ باشد: اگر تنه خیلی بیشتر از شانه و اندام‌ها برآمد
  // کند، پیکره «گلابی‌مانند» و بازوها عجیب‌الحال می‌شوند. ضریبِ شانه/بازو
  // تقریباً هم‌ترازِ رشدِ اندام نگه داشته شده تا بازو با بقیهٔ بدن فربه شود،
  // و شکم همچنان بیشترین سهم را داشته باشد — ولی بدون انفجارِ نسبی.
  // سر یک واحدِ صُلب است: پهنایش باید هم‌پای بلندی‌اش تغییر کند، وگرنه سرِ
  // بزرگِ کودک کشیده و غیرطبیعی می‌شود.
  const headScale = (chin - crown) / REF_HEAD;
  const headWidth = (headScale / statureScale) * (1 + 0.06 * childness);

  const fat = plumpness;
  const thin = leanness;

  /**
   * رشدِ چاقی: تا آستانهٔ چاقیِ واضح (واحدِ اول) خطی و کامل؛ بعد از آن با شیبِ
   * ملایم‌تر. اگر همهٔ ضرایب تا بی‌نهایت خطی بمانند، در BMIهای خیلی بالا شکم
   * از بازوها جلو می‌زند، فاصلهٔ بازو و تنه ته می‌کشد و گردن هم باد می‌کند.
   */
  const growth = (tailRate: number): number => (fat <= 1 ? fat : 1 + tailRate * (fat - 1));

  // تفاوت‌های جنسیتی در خودِ سیلوئتِ مرجع پخته شده‌اند؛ این‌جا فقط اثرِ سن و
  // وزن اعمال می‌شود تا دو اثر روی هم سوار نشوند.
  const shoulder = (1 - 0.10 * childness) * (1 + 0.28 * growth(0.7) - 0.09 * thin);
  const neck =
    (0.45 * headWidth + 0.55 * shoulder) * (1 + 0.14 * growth(0.35) - 0.07 * thin);

  const knots: readonly (readonly [number, number])[] = [
    [REF.crown, headWidth * (1 + 0.04 * growth(0.5) - 0.02 * thin)],
    [40, headWidth * (1 + 0.04 * growth(0.5) - 0.02 * thin)],
    [REF.chin, (0.7 * headWidth + 0.3 * neck) * (1 + 0.07 * growth(0.5))],
    [88, neck],
    [REF.shoulder, shoulder],
    [150, shoulder * (1 + 0.06 * growth(0.6))],
    [REF.chest, (1 + 0.03 * childness) * (1 + 0.32 * growth(0.6) - 0.13 * thin)],
    [REF.waist, (1 + 0.05 * childness) * (1 + 0.48 * growth(0.45) - 0.18 * thin)],
    [285, (1 + 0.07 * childness) * (1 + 0.52 * growth(0.45) - 0.19 * thin)],
    [REF.hip, (1 + 0.02 * childness) * (1 + 0.40 * growth(0.5) - 0.16 * thin)],
    [400, (1 + 0.02 * childness) * (1 + 0.34 * growth(0.7) - 0.16 * thin)],
    [REF.knee, 1 + 0.22 * growth(0.8) - 0.10 * thin],
    [510, 1 + 0.24 * growth(0.8) - 0.13 * thin],
    [REF.ankle, 1 + 0.11 * growth(0.9) - 0.07 * thin],
    [REF.sole, 1 + 0.09 * growth(1) - 0.06 * thin],
  ];

  const widthAt = makeMonotoneSpline(
    knots.map(([y]) => y),
    knots.map(([, k]) => k),
  );

  return {
    remapY,
    coreEdgeAt,
    baseCommands: parseCommands(outline.path),
    coreScale: (y: number) => statureScale * widthAt(y),
    limbScale:
      statureScale * (1 - 0.04 * childness) * (1 + 0.30 * growth(0.75) - 0.16 * thin),
    statureScale,
    headScale,
    landmarks,
  };
}

/**
 * پادِ اولیهٔ smoothstep: انتگرالِ t²(۳−۲t) برابرِ t³−t⁴/2 است.
 * برای ساختِ رمپی که مقدار و مشتقش هم‌زمان پیوسته باشند لازمش داریم.
 */
const smoothStepIntegral = (t: number): number => {
  const t2 = t * t;
  return t2 * t - (t2 * t2) / 2;
};

/**
 * فاصلهٔ وارپ‌شدهٔ یک نقطه تا محور، در ارتفاع مرجع `y`.
 *
 * داخلِ تنه ضریبِ تنه (`core`) اعمال می‌شود؛ بیرونِ آن به‌تدریج — روی رمپی
 * به پهنای نصفِ لبه — به ضریبِ اندام (`limb`) می‌رسد. چون گذر از طریق
 * انتگرالِ smoothstep است، مشتقِ نگاشت هیچ‌جا نمی‌پرد و خطوطی که از لبهٔ تنه
 * عبور می‌کنند (بغلِ بازو، کمربندِ لگن) شکستگی و کجی نمی‌گیرند.
 */
function warpDistance(
  geometry: Geometry,
  distance: number,
  y: number,
): number {
  const core = geometry.coreScale(y);
  const edge = geometry.coreEdgeAt(y);
  const separation = armSeparationAt(y);

  if (separation <= 0 || distance <= edge) return distance * core;

  const limb = geometry.limbScale;
  const ramp = Math.max(edge * 0.6, 8);
  if (distance >= edge + ramp) {
    // دنبالهٔ خطی: جابه‌جاییِ اندام + آفستِ انباشته‌شدهٔ رمپ
    const offset = (core - limb) * (edge + ramp / 2);
    const piecewise = distance * limb + offset;
    return distance * core + (piecewise - distance * core) * separation;
  }

  const t = (distance - edge) / ramp;
  const piecewise =
    edge * core +
    core * (distance - edge) +
    (limb - core) * ramp * smoothStepIntegral(t);
  return distance * core + (piecewise - distance * core) * separation;
}

/** نگاشتِ یک نقطهٔ سیلوئت مرجع به پیکرهٔ جدید. */
function warpPoint(geometry: Geometry, x: number, y: number): [number, number] {
  const offset = x - CENTER_X;
  const mapped = warpDistance(geometry, Math.abs(offset), y);
  const sign = offset < 0 ? -1 : 1;
  return [CENTER_X + sign * mapped, geometry.remapY(y)];
}

// ─── وارپ کردنِ مسیر ─────────────────────────────────────────────────────────

type Command = { readonly type: "M" | "L" | "C" | "Z"; readonly points: number[] };

const commandCache = new Map<string, readonly Command[]>();

/** تحلیلِ مسیرِ مرجع (فقط M/L/C/Z دارد)؛ برای هر جنسیت یک‌بار. */
function parseCommands(path: string): readonly Command[] {
  const cached = commandCache.get(path);
  if (cached) return cached;

  const tokens = path.match(/[MLCZ]|-?\d+(?:\.\d+)?/g) ?? [];
  const commands: Command[] = [];
  let i = 0;

  while (i < tokens.length) {
    const type = tokens[i] as Command["type"];
    i += 1;
    const count = type === "C" ? 6 : type === "Z" ? 0 : 2;
    const points: number[] = [];
    for (let k = 0; k < count; k += 1) points.push(Number(tokens[i + k] ?? 0));
    i += count;
    commands.push({ type, points });
  }

  commandCache.set(path, commands);
  return commands;
}

/**
 * شکستنِ یک منحنی مکعبی به `count` تکه.
 *
 * وارپ غیرخطی است؛ اگر فقط نقاط کنترلِ اصلی جابه‌جا شوند، بدنهٔ منحنی کمی از
 * مسیر درست منحرف می‌شود. تقسیمِ پیش از وارپ این خطا را عملاً حذف می‌کند.
 */
function subdivideCubic(
  p0: readonly [number, number],
  points: readonly number[],
  count: number,
): number[][] {
  const split = (a: readonly number[], t: number) => {
    const ab: [number, number, number] = [
      at(a, 0) + (at(a, 1) - at(a, 0)) * t,
      at(a, 1) + (at(a, 2) - at(a, 1)) * t,
      at(a, 2) + (at(a, 3) - at(a, 2)) * t,
    ];
    const abc: [number, number] = [ab[0] + (ab[1] - ab[0]) * t, ab[1] + (ab[2] - ab[1]) * t];
    return { value: abc[0] + (abc[1] - abc[0]) * t, ab, abc };
  };

  const segments: number[][] = [];
  let xs: [number, number, number, number] = [p0[0], at(points, 0), at(points, 2), at(points, 4)];
  let ys: [number, number, number, number] = [p0[1], at(points, 1), at(points, 3), at(points, 5)];

  for (let i = 0; i < count; i += 1) {
    if (i === count - 1) {
      segments.push([xs[1], ys[1], xs[2], ys[2], xs[3], ys[3]]);
      break;
    }
    const t = 1 / (count - i);
    const sx = split(xs, t);
    const sy = split(ys, t);
    segments.push([sx.ab[0], sy.ab[0], sx.abc[0], sy.abc[0], sx.value, sy.value]);
    xs = [sx.value, sx.abc[1], sx.ab[2], xs[3]];
    ys = [sy.value, sy.abc[1], sy.ab[2], ys[3]];
  }

  return segments;
}

const SUBDIVISIONS = 3;

interface WarpedPath {
  readonly commands: { type: Command["type"]; points: number[] }[];
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

function warpBasePath(geometry: Geometry): WarpedPath {
  const result: WarpedPath = {
    commands: [],
    minX: Infinity,
    maxX: -Infinity,
    minY: Infinity,
    maxY: -Infinity,
  };

  const track = (point: [number, number]) => {
    if (point[0] < result.minX) result.minX = point[0];
    if (point[0] > result.maxX) result.maxX = point[0];
    if (point[1] < result.minY) result.minY = point[1];
    if (point[1] > result.maxY) result.maxY = point[1];
    return point;
  };

  let cursor: [number, number] = [0, 0];

  for (const command of geometry.baseCommands) {
    if (command.type === "Z") {
      result.commands.push({ type: "Z", points: [] });
      continue;
    }

    if (command.type === "M" || command.type === "L") {
      cursor = [at(command.points, 0), at(command.points, 1)];
      result.commands.push({
        type: command.type,
        points: track(warpPoint(geometry, cursor[0], cursor[1])),
      });
      continue;
    }

    for (const piece of subdivideCubic(cursor, command.points, SUBDIVISIONS)) {
      const warped: number[] = [];
      for (let k = 0; k < 6; k += 2) {
        const point = warpPoint(geometry, at(piece, k), at(piece, k + 1));
        // فقط نقاط روی منحنی برای جعبهٔ محیطی مهم‌اند؛ نقاط کنترل بیرون‌زدگی
        // کاذب می‌سازند و قاب را بی‌دلیل بزرگ می‌کنند.
        if (k === 4) track(point);
        warped.push(point[0], point[1]);
      }
      result.commands.push({ type: "C", points: warped });
    }
    cursor = [at(command.points, 4), at(command.points, 5)];
  }

  return result;
}

function serialize(
  commands: readonly { type: Command["type"]; points: number[] }[],
  scale: number,
): string {
  const map = (x: number, y: number): string =>
    `${(CENTER_X + (x - CENTER_X) * scale).toFixed(2)},${(GROUND_Y + (y - GROUND_Y) * scale).toFixed(2)}`;

  let out = "";
  for (const command of commands) {
    if (command.type === "Z") {
      out += "Z";
      continue;
    }
    const p = command.points;
    if (command.type === "C") {
      out += `C${map(at(p, 0), at(p, 1))} ${map(at(p, 2), at(p, 3))} ${map(at(p, 4), at(p, 5))}`;
      continue;
    }
    out += `${command.type}${map(at(p, 0), at(p, 1))}`;
  }
  return out;
}

// ─── موی پیکرهٔ زن ───────────────────────────────────────────────────────────

/**
 * تفاوتِ زن و مرد عمدتاً از تناسبِ شانه/کمر/لگن می‌آید، ولی آن تفاوت در نگاهِ
 * اول قطعی نیست. یک موی تا شانه، نشانهٔ کوچکی است که تشخیص را فوری می‌کند
 * بی‌آنکه سبکِ آناتومیکِ تصویر را به‌هم بزند.
 */
function buildHairPath(geometry: Geometry, scale: number): string {
  const { crown, chin, shoulder } = geometry.landmarks;
  const h = chin - crown;
  const half = REF_HEAD_HALF * geometry.headScale;

  const fit = (k: number, y: number): string =>
    `${(CENTER_X + k * scale).toFixed(2)},${(GROUND_Y + (y - GROUND_Y) * scale).toFixed(2)}`;

  // مو روی سر کشیده می‌شود (نه پشتِ آن)؛ پس بالای جمجمه پوشیده است و فقط
  // «صورت» از زیرِ چتری بیرون می‌ماند. همین یک نشانه، پیکره را از دور زنانه
  // می‌کند بی‌آنکه چهره‌ای رسم کنیم.
  const cap = half * 1.06;
  const out = half * 1.25;
  const inn = half * 0.94;

  const top = crown - h * 0.06;
  const temple = crown + h * 0.3;
  const fringe = crown + h * 0.53;
  const bottom = chin + (shoulder - chin) * 1.02;

  return [
    `M${fit(-cap, temple)}`,
    `C${fit(-cap * 1.02, top)} ${fit(cap * 1.02, top)} ${fit(cap, temple)}`,
    `C${fit(out * 0.99, chin - h * 0.12)} ${fit(out, chin + h * 0.2)} ${fit(out * 0.86, bottom)}`,
    `C${fit(out * 0.8, bottom + h * 0.07)} ${fit(inn * 1.25, bottom + h * 0.06)} ${fit(inn, bottom - h * 0.06)}`,
    `C${fit(inn, chin + h * 0.12)} ${fit(inn, chin - h * 0.18)} ${fit(inn * 0.96, temple + h * 0.07)}`,
    `C${fit(inn * 0.62, fringe)} ${fit(-inn * 0.62, fringe)} ${fit(-inn * 0.96, temple + h * 0.07)}`,
    `C${fit(-inn, chin - h * 0.18)} ${fit(-inn, chin + h * 0.12)} ${fit(-inn, bottom - h * 0.05)}`,
    `C${fit(-inn * 1.25, bottom + h * 0.06)} ${fit(-out * 0.8, bottom + h * 0.07)} ${fit(-out * 0.86, bottom)}`,
    `C${fit(-out, chin + h * 0.2)} ${fit(-out * 0.99, chin - h * 0.12)} ${fit(-cap, temple)}`,
    "Z",
  ].join("");
}

// ─── ساختِ نهایی ─────────────────────────────────────────────────────────────

const cache = new Map<string, BodyShape>();

function cacheKey(profile: BodyProfile): string {
  const round = (value: unknown, step: number) =>
    Number.isFinite(Number(value)) ? Math.round(Number(value) / step) * step : "-";
  return [
    round(profile.heightCm, 1),
    round(profile.weightKg, 1),
    round(profile.ageYears, 1),
    profile.sex ?? "-",
  ].join("|");
}

/**
 * سیلوئت و تبدیل‌های اندام را برای یک پروفایل می‌سازد.
 * نتیجه کش می‌شود؛ هر رندرِ دوباره با همان پروفایل، هزینه‌ای ندارد.
 */
export function computeBodyShape(profile: BodyProfile = {}): BodyShape {
  const key = cacheKey(profile);
  const cached = cache.get(key);
  if (cached) return cached;

  const metrics = readMetrics(profile);
  const geometry = buildGeometry(metrics);
  const warped = warpBasePath(geometry);

  // اگر پیکره از قاب بزند (تنِ خیلی درشت)، یک مقیاسِ یکنواختِ نهایی نجاتش
  // می‌دهد. یکنواخت است تا تناسب‌ها دست‌نخورده بماند.
  const overflowX = Math.max(
    (CENTER_X - FRAME_X) / Math.max(CENTER_X - warped.minX, 1),
    (FRAME_X + FRAME_W - CENTER_X) / Math.max(warped.maxX - CENTER_X, 1),
  );
  const overflowY = GROUND_Y / Math.max(GROUND_Y - warped.minY, 1);
  const fit = Math.min(1, overflowX, overflowY);

  const shape: BodyShape = {
    bodyD: serialize(warped.commands, fit),
    hairD: metrics.female ? buildHairPath(geometry, fit) : null,
    viewBox: BODY_VIEW_BOX,
    ...buildOrganTransforms(geometry, fit),
  };

  cache.set(key, shape);
  return shape;
}

function buildOrganTransforms(
  geometry: Geometry,
  fit: number,
): Pick<BodyShape, "organTransform" | "headOrganTransform"> {
  const applyFit = (x: number, y: number): [number, number] => [
    CENTER_X + (x - CENTER_X) * fit,
    GROUND_Y + (y - GROUND_Y) * fit,
  ];

  // ── اندام‌های تنه ──
  const bandTop = geometry.remapY(ORGAN_BAND.top);
  const bandBottom = geometry.remapY(ORGAN_BAND.bottom);

  const verticalScale = (bandBottom - bandTop) / (ORGAN_BAND.bottom - ORGAN_BAND.top);
  // پهنای در دسترسِ تنه در باریک‌ترین نقطهٔ خوشه؛ اندام‌ها هرگز نباید از بدن بزنند.
  const widthScale = Math.min(
    geometry.coreScale(REF.chest),
    geometry.coreScale(REF.waist),
    geometry.coreScale(REF.hip),
  );
  const torsoScale =
    Math.min((verticalScale + widthScale) / 2, (widthScale * geometry.coreEdgeAt(REF.chest)) / ORGAN_HALF) *
    fit;

  const bandCenterY = (bandTop + bandBottom) / 2;
  const [torsoX, torsoY] = applyFit(CENTER_X, bandCenterY);

  // ── مغز ──
  // سر واحدِ مستقلی است: با نسبتِ سر به بدن بزرگ و کوچک می‌شود، نه با قد.
  const headScale = geometry.headScale * fit;
  const brainY = geometry.landmarks.crown + (BRAIN_CENTER.y - REF.crown) * geometry.headScale;
  const [brainCx, brainCy] = applyFit(CENTER_X, brainY);

  const transform = (
    cx: number,
    cy: number,
    scale: number,
    refX: number,
    refY: number,
  ): string =>
    `translate(${(cx - scale * refX).toFixed(3)} ${(cy - scale * refY).toFixed(3)}) scale(${scale.toFixed(5)})`;

  return {
    organTransform: transform(
      torsoX,
      torsoY,
      torsoScale,
      ORGAN_BAND.centerX,
      (ORGAN_BAND.top + ORGAN_BAND.bottom) / 2,
    ),
    headOrganTransform: transform(brainCx, brainCy, headScale, BRAIN_CENTER.x, BRAIN_CENTER.y),
  };
}

/** اندام‌هایی که به‌جای تنه، به سر تعلق دارند. */
export const HEAD_ORGAN_KEYS: ReadonlySet<string> = new Set(["stroke"]);
