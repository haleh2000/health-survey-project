// src/design-system/illustrations/anatomy/body-shape.ts

import {
  BASE_BODY_PATH,
  CORE_HALF_STEP,
  CORE_HALF_WIDTH,
} from "./body-base-path";

export type BodySex = "male" | "female";

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
  /** بیضیِ سایهٔ زیر پا. */
  readonly groundShadow: { readonly cx: number; readonly cy: number; readonly rx: number };
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
  knee: 700,
  ankle: 548,
  sole: 595,
} as const;

const REF_HEIGHT = REF.sole - REF.crown; // ۵۸۹
const REF_HEAD = REF.chin - REF.crown; // ۶۶
/** نیم‌پهنای سر در پهن‌ترین جا. */
const REF_HEAD_HALF = 29;

/** ارتفاعِ ترسیمیِ یک بزرگسالِ ۱۷۵ سانتی‌متری؛ مبنای همهٔ مقیاس‌ها. */
const BASE_DRAW_HEIGHT = 545;

/**
 * پنجرهٔ ارتفاعی‌ای که بازوها از تنه جدا دیده می‌شوند.
 *
 * فاز ورود باید بلند باشد و از سرشانه شروع شود. با پنجرهٔ کوتاه، رژیمِ
 * مقیاس‌گذاری از `coreScale` به `limbScale` در چند واحد ارتفاع سوئیچ می‌کند و
 * چون این دو ضریب برابر نیستند، لبهٔ بیرونیِ بازو یک جهشِ جانبی می‌خورد که
 * روی رندر عیناً شبیه درزِ آستین دیده می‌شود.
 */
const ARM_FADE_IN: readonly [number, number] = [110, 232];
const ARM_FADE_OUT: readonly [number, number] = [366, 380];

/**
 * چقدر بازو به تنه نزدیک شود — نسبتی از نیم‌پهنای تنه در همان ارتفاع.
 * جابه‌جاییِ صُلبِ نوارِ بازو است، پس ضخامتِ بازو و دست تغییر نمی‌کند.
 */
const ARM_HUG = 0.01;

/**
 * پهنای بافرِ نرم روی مرزِ تنه/بازو (در مختصات مرجع).
 * بدون این بافر، تغییرِ رژیمِ مقیاس‌گذاری روی خطِ `coreHalfAt(y)` یک شکستگیِ
 * مشتق می‌سازد که در زیربغل و بالای شانه به شکلِ گوشهٔ تیز دیده می‌شود.
 */
const ARM_EDGE_SOFT = 16;

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
 * هموارسازیِ کوینتیک — مشتقِ اول *و دوم* در دو سرِ بازه صفر است.
 *
 * `smoothStep` فقط C¹ است؛ پرشِ مشتقِ دومش روی سیلوئت به شکلِ یک چینِ باریکِ
 * افقی دیده می‌شود. هر جا که رژیمِ هندسی عوض می‌شود (مرزِ تنه/بازو و پنجرهٔ
 * جداسازیِ بازو) به C² نیاز داریم تا لبه یک‌دست بماند.
 */
function smootherStep(value: number, a: number, b: number): number {
  const t = clamp((value - a) / (b - a), 0, 1);
  return t * t * t * (t * (6 * t - 15) + 10);
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

/** نیم‌پهنای مرجعِ تنه در ارتفاع `y` (درون‌یابیِ خطیِ جدول). */
function coreHalfAt(y: number): number {
  const position = y / CORE_HALF_STEP;
  const index = Math.floor(position);
  if (index < 0) return at(CORE_HALF_WIDTH, 0);
  if (index >= CORE_HALF_WIDTH.length - 1) {
    return at(CORE_HALF_WIDTH, CORE_HALF_WIDTH.length - 1);
  }
  const t = position - index;
  return at(CORE_HALF_WIDTH, index) * (1 - t) + at(CORE_HALF_WIDTH, index + 1) * t;
}

/** چقدر در این ارتفاع باید بازو را از تنه جدا حساب کرد (۰ تا ۱). */
function armSeparationAt(y: number): number {
  return (
    smootherStep(y, ARM_FADE_IN[0], ARM_FADE_IN[1]) *
    (1 - smootherStep(y, ARM_FADE_OUT[0], ARM_FADE_OUT[1]))
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
    plumpness: clamp(delta / 12, 0, 1.2),
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
  readonly limbScale: number;
  readonly statureScale: number;
  readonly headScale: number;
  readonly landmarks: Record<keyof typeof REF, number>;
}

function buildGeometry(metrics: Metrics): Geometry {
  const { childness, plumpness, leanness, female, drawHeight } = metrics;

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
  // سر یک واحدِ صُلب است: پهنایش باید هم‌پای بلندی‌اش تغییر کند، وگرنه سرِ
  // بزرگِ کودک کشیده و غیرطبیعی می‌شود.
  const headScale = (chin - crown) / REF_HEAD;
  const headWidth = (headScale / statureScale) * (1 + 0.06 * childness) * (female ? 0.97 : 1);

  const fat = plumpness;
  const thin = leanness;
  const sex = (femaleFactor: number) => (female ? femaleFactor : 1);

  const shoulder =
    (1 - 0.10 * childness) * sex(0.935) * (1 + 0.14 * fat - 0.06 * thin);
  const neck =
    (0.45 * headWidth + 0.55 * shoulder) * sex(0.96) * (1 + 0.16 * fat - 0.07 * thin);

  const knots: readonly (readonly [number, number])[] = [
    [REF.crown, headWidth * (1 + 0.05 * fat - 0.02 * thin)],
    [40, headWidth * (1 + 0.05 * fat - 0.02 * thin)],
    [REF.chin, (0.7 * headWidth + 0.3 * neck) * (1 + 0.09 * fat)],
    [88, neck],
    [REF.shoulder, shoulder],
    [150, shoulder * (1 + 0.05 * fat)],
    [REF.chest, (1 + 0.03 * childness) * sex(1.0) * (1 + 0.28 * fat - 0.12 * thin)],
    [REF.waist, (1 + 0.05 * childness) * sex(0.925) * (1 + 0.52 * fat - 0.19 * thin)],
    [285, (1 + 0.07 * childness) * sex(0.965) * (1 + 0.58 * fat - 0.20 * thin)],
    [REF.hip, (1 + 0.02 * childness) * sex(1.075) * (1 + 0.42 * fat - 0.16 * thin)],
    [400, (1 + 0.02 * childness) * sex(1.05) * (1 + 0.36 * fat - 0.17 * thin)],
    [REF.knee, sex(1.0) * (1 + 0.18 * fat - 0.09 * thin)],
    [510, sex(0.99) * (1 + 0.26 * fat - 0.13 * thin)],
    [REF.ankle, sex(0.97) * (1 + 0.10 * fat - 0.06 * thin)],
    [REF.sole, sex(0.95) * (1 + 0.08 * fat - 0.05 * thin)],
  ];

  const widthAt = makeMonotoneSpline(
    knots.map(([y]) => y),
    knots.map(([, k]) => k),
  );
  

  return {
    remapY,
    coreScale: (y: number) => statureScale * widthAt(y),
    limbScale:
      statureScale *
      (1 - 0.04 * childness) *
      (female ? 0.97 : 1) *
      (1 + 0.30 * fat - 0.16 * thin),
    statureScale,
    headScale,
    landmarks,
  };
  
}

/**
 * نگاشتِ یک نقطهٔ سیلوئت مرجع به پیکرهٔ جدید.
 *
 * وزنِ رژیمِ بازو حاصل‌ضربِ دو عاملِ C² است: `separation` (ارتفاع) و `outward`
 * (فاصله از محور). هر دو در مرزها مشتقِ اول و دومِ صفر دارند، پس گذار از تنه
 * به بازو هیچ لبه یا چینِ قابل‌دیدنی نمی‌سازد. کششِ `ARM_HUG` با همان وزن
 * اعمال می‌شود و هیچ `clamp`ی در مسیر نیست — clamp روی لبه گوشه می‌سازد.
 */
function warpPoint(geometry: Geometry, x: number, y: number): [number, number] {
  const offset = x - CENTER_X;
  const distance = Math.abs(offset);
  const core = geometry.coreScale(y);

  const uniform = distance * core;
  const separation = armSeparationAt(y);

  let mapped = uniform;
  if (separation > 0) {
    const edge = coreHalfAt(y);
    const edgeMapped = edge * core;

    const limbed = edgeMapped + (distance - edge) * geometry.limbScale;
    const outward = smootherStep(distance, edge - ARM_EDGE_SOFT, edge + ARM_EDGE_SOFT);

    const blend = separation * outward;
    mapped = uniform + (limbed - uniform) * blend;
    mapped -= ARM_HUG * edgeMapped * blend;
  }

  const sign = offset < 0 ? -1 : 1;
  return [CENTER_X + sign * mapped, geometry.remapY(y)];
}

// ─── وارپ کردنِ مسیر ─────────────────────────────────────────────────────────

type Command = { readonly type: "M" | "L" | "C" | "Z"; readonly points: number[] };

/** تحلیلِ یک‌بارهٔ مسیر مرجع (فقط M/L/C/Z دارد). */
const BASE_COMMANDS: readonly Command[] = (() => {
  const tokens = BASE_BODY_PATH.match(/[MLCZ]|-?\d+(?:\.\d+)?/g) ?? [];
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

  return commands;
})();

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

/**
 * تعدادِ تکه‌ها در هر منحنی. شش تکه خطای وارپِ قوس‌های بلند (بازو، ران) را
 * نسبت به سه تکه تقریباً نصف می‌کند؛ هزینه‌اش فقط چند کاراکترِ بیشتر در `d`.
 */
const SUBDIVISIONS = 6;

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

  for (const command of BASE_COMMANDS) {
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
  const headLength = chin - crown;
  const half = REF_HEAD_HALF * geometry.headScale * 1.13;

  const fit = (x: number, y: number): string =>
    `${(CENTER_X + (x - CENTER_X) * scale).toFixed(2)},${(GROUND_Y + (y - GROUND_Y) * scale).toFixed(2)}`;

  const temple = chin - headLength * 0.52;
  const top = crown - headLength * 0.06;
  const bottom = chin + (shoulder - chin) * 0.78;

  return [
    `M${fit(CENTER_X - half * 0.96, temple)}`,
    `C${fit(CENTER_X - half * 1.04, top)} ${fit(CENTER_X + half * 1.04, top)} ${fit(CENTER_X + half * 0.96, temple)}`,
    `C${fit(CENTER_X + half, chin - headLength * 0.18)} ${fit(CENTER_X + half * 0.99, bottom - headLength * 0.24)} ${fit(CENTER_X + half * 0.86, bottom)}`,
    `C${fit(CENTER_X + half * 0.46, bottom + headLength * 0.1)} ${fit(CENTER_X - half * 0.46, bottom + headLength * 0.1)} ${fit(CENTER_X - half * 0.86, bottom)}`,
    `C${fit(CENTER_X - half * 0.99, bottom - headLength * 0.24)} ${fit(CENTER_X - half, chin - headLength * 0.18)} ${fit(CENTER_X - half * 0.96, temple)}`,
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
    groundShadow: {
      cx: CENTER_X,
      cy: GROUND_Y - 2,
      rx: clamp(70 * geometry.statureScale * (1 + 0.25 * metrics.plumpness), 34, 110),
    },
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
    Math.min((verticalScale + widthScale) / 2, (widthScale * coreHalfAt(REF.chest)) / ORGAN_HALF) *
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
