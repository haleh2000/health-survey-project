// src/design-system/illustrations/anatomy/body-base-path.ts
// ─────────────────────────────────────────────────────────────────────────────
// هندسهٔ مرجعِ پیکرهٔ انسان — نیمهٔ راست، ساخته‌شده از نقاطِ آناتومیک.
//
// چرا دیگر از سیلوئتِ ردیابی‌شده استفاده نمی‌کنیم:
//   نسخهٔ پیشین کمانِ راستِ یک سیلوئتِ وکتورشده از تصویر بود: ۵۳۵ نقطهٔ بِزیه
//   که نویزِ ردیابی را با خود داشتند. آینه‌شدن آن نویز را دوبرابر می‌کرد و
//   وارپِ چاق/لاغر بزرگ‌نمایی‌اش می‌کرد؛ نتیجه انگشتانِ کرم‌مانند، کفِ پای
//   قلمبه و شقیقهٔ گود بود.
//
//   حالا سیلوئت از «نقاطِ نشانه» ساخته می‌شود: هر نقطه یک جای مشخص روی بدن
//   است (دلتوئید، اپی‌کندیلِ آرنج، برجستگیِ ساق، قوزک، سرِ استخوانِ کف‌دستی…)
//   و منحنی‌های مکعبی از روی همان‌ها با Catmull-Rom تولید می‌شوند. پس هر عدد
//   معنا دارد و قابلِ تنظیم است، و هیچ نویزی بینِ نقاط نمی‌ماند.
//
// مقیاس: بومِ ۴۰۰×۶۰۰، تارک در y=6 و کفِ پا در y=595 ⇒ ۵۸۹ واحد ≈ ۱۷۵ سانتی‌متر
// (هر واحد ≈ ۳ میلی‌متر). همهٔ پهناها با همین نسبت از اندازه‌های انسان‌سنجیِ
// بزرگسالِ مرد گرفته شده‌اند.
//
// خروجی برای هر جنسیت یک‌بار ساخته و کش می‌شود.
// ─────────────────────────────────────────────────────────────────────────────

import type { Region, ShapeFactors } from "./body-keyframes";

export type BodySex = "male" | "female";

/** گام نمونه‌برداریِ جدولِ نیم‌پهنای تنه (پیکسل). */
export const CORE_HALF_STEP = 4;

/** محورِ تقارنِ بوم مرجع 400×600. */
const CENTER_X = 200;

export interface BaseOutline {
  /** مسیرِ بستهٔ سیلوئت در بوم 400×600. */
  readonly path: string;
  /** نیم‌پهنای «تنه» (بدون بازوها) در هر ارتفاع، هر `CORE_HALF_STEP` پیکسل. */
  readonly coreHalf: readonly number[];
}

// ─── نمایشِ نقاطِ نشانه ───────────────────────────────────────────────────────

/**
 * یک نقطهٔ نشانه: فاصله از محورِ تقارن، ارتفاع، و «نرمی».
 *
 * نرمی ضریبِ مماسِ Catmull-Rom است: ۱ یعنی گذرِ کاملاً هموار، ۰ یعنی گوشهٔ
 * تیز. با آن می‌شود گودیِ بینِ انگشتان را تیز و نوکِ انگشت را گرد نگه داشت
 * بی‌آنکه لازم باشد دستیِ دو نقطهٔ کنترل نوشته شود.
 */
type Pt = readonly [dx: number, y: number, smooth?: number];

const clampIndex = (index: number, length: number): number =>
  index < 0 ? 0 : index > length - 1 ? length - 1 : index;

/**
 * زنجیرهٔ نقاط ← آرایهٔ تختِ مکعبی‌ها: `[x0,y0, c1x,c1y,c2x,c2y,x1,y1, …]`.
 *
 * مماسِ هر نقطه از وترِ همسایه‌هایش می‌آید (Catmull-Rom یکنواخت)، پس منحنی
 * از همهٔ نقاطِ نشانه *عبور* می‌کند — برخلاف B-spline که فقط به آن‌ها نزدیک
 * می‌شود و جای دقیقِ قوزک یا نوکِ انگشت را جابه‌جا می‌کند.
 */
function toCubics(points: readonly Pt[]): number[] {
  const n = points.length;
  const P = (i: number): Pt => points[clampIndex(i, n)] as Pt;

  const first = P(0);
  const flat: number[] = [first[0], first[1]];

  for (let i = 0; i < n - 1; i += 1) {
    const p0 = P(i - 1);
    const p1 = P(i);
    const p2 = P(i + 1);
    const p3 = P(i + 2);
    const s1 = p1[2] ?? 1;
    const s2 = p2[2] ?? 1;

    flat.push(
      p1[0] + ((p2[0] - p0[0]) / 6) * s1,
      p1[1] + ((p2[1] - p0[1]) / 6) * s1,
      p2[0] - ((p3[0] - p1[0]) / 6) * s2,
      p2[1] - ((p3[1] - p1[1]) / 6) * s2,
      p2[0],
      p2[1],
    );
  }

  return flat;
}

// ─── نشانه‌های بدن ───────────────────────────────────────────────────────────
// قانونِ تناسب: تارک y=6، کفِ پا y=595 ⇒ ۵۸۹ واحد ≈ ۱۷۵ سانتی‌متر، و چانه در
// y=84 ⇒ قد برابرِ ۷٫۵ سرِ انسانی. (نسخهٔ پیشین ۸٫۹ سر بود؛ همان یک عدد باعث
// می‌شد پیکره «دراز و لاغر» دیده شود، هرچه پهناها را درست می‌کردیم.)
//
// همهٔ زنجیره‌ها به ترتیبِ پیمایشِ سیلوئت‌اند: از تارک، پایین از کنارِ راست،
// دورِ دست، پایینِ پا، دورِ کف پا، و بالا از داخلِ ران تا فاق.

/** تارک → گوشهٔ آخرومی (شانه). پهنای جمجمه ۱۵٫۵ سانت، گردن ۱۲ سانت. */
const HEAD_TO_SHOULDER: readonly Pt[] = [
  [0, 6],           // تارک، روی محور
  [9.4, 6.9],
  [17.6, 11],
  [23.6, 19],
  [26.2, 28],
  [26.4, 35],       // پهن‌ترین جای جمجمه (آهیانه)
  [25.0, 44],       // گودیِ شقیقه — بدونِ آن، سر یک تخم‌مرغ می‌شود
  [26.9, 49],       // بالای لالهٔ گوش
  [27.2, 55],
  [25.4, 61],       // نرمهٔ گوش
  [23.4, 66],       // گونه
  [20.8, 71, 0.4],  // زاویهٔ فک — گوشه، وگرنه فک دیده نمی‌شود
  [17.6, 78],       // فک به گردن می‌رسد (چانه در y=84 پشتِ گردن می‌ماند)
  [16.9, 88],       // گردن — باید آشکارا از سر باریک‌تر باشد
  [18.6, 95],
  [22.4, 100],      // ذوزنقه — شیبِ شانه ~۲۲ درجه
  [31, 104.5],
  [42, 108.5],
  [54, 112],
  [63, 115.5],
  [69, 120],        // آخرومی
];

/**
 * آخرومی → لبهٔ بیرونیِ مچ.
 *
 * محورِ بازو از (۶۰, ۱۲۴) تا (۸۶, ۳۲۰) می‌رود — یعنی حدودِ ۷٫۵ درجه دور شدن
 * از تنه. کم‌تر از این، بازو به تنه می‌چسبد و زیربغل ناپدید می‌شود؛ بیش‌تر،
 * پیکره حالتِ «بال‌گشوده» می‌گیرد.
 */
const ARM_LATERAL: readonly Pt[] = [
  [75.6, 128],
  [79, 141],   // برجستگیِ دلتوئید
  [81, 152],
  [82.6, 170],
  [77.4, 136],
  [85.1, 192],
  [86.2, 216],
  [87, 220],     // اپی‌کندیلِ بیرونیِ آرنج
  [90.2, 256],
  [93, 290],   // پهن‌ترین جای ساعد (براکیورادیالیس)
  [92.5, 276],
  [93.68, 295],
  [94.6, 304],
  [96, 320],     // لبهٔ بیرونیِ مچ
];

/** لبهٔ داخلیِ مچ → زیربغل. (به ترتیبِ پیمایش، از پایین به بالا.) */
const ARM_MEDIAL: readonly Pt[] = [
  [76, 340],
  [72.4, 306],
  [69, 290],
  [65.8, 274],
  [63.3, 252],
  [62.6, 248],
  [62, 243],     // اپی‌کندیلِ داخلیِ آرنج
  [58.6, 216],
  [57.1, 207],
  [52.1, 168],
  [50.7, 178, 0.4], // نوکِ زیربغل — گوشه است، نه قوس
];

/** زیربغل → قوزکِ بیرونی: دیوارهٔ کناریِ تنه و بعد پای راست. */
const TORSO_TO_ANKLE: readonly Pt[] = [
  [50.8, 186],
  [51, 196],
  [50.4, 210],
  [48.4, 220],
  [46.4, 230],   // باریک‌ترین جای کمر
  [46.6, 244],
  [48, 258],
  [51, 272],
  [55, 285],
  [57.8, 299],   // پهن‌ترین جای لگن (تروکانتر)
  [57.6, 308],
  [57.2, 320],
  [56.8, 332],   // بالای ران
  [55.2, 352],
  [53.2, 372],
  [51, 392],
  [48.4, 412],
  [45.8, 428],
  [45, 438],     // زانو
  [43.8, 452],
  [43, 464],
  [42.6, 474],   // برجستگیِ ساقِ بیرونی
  [41.2, 492],
  [38.6, 512],
  [36, 534],
  [34.6, 550],
  [34.2, 562],   // قوزکِ بیرونی
];

/**
 * قوزکِ بیرونی → قوزکِ داخلی، از رویِ کفِ پا (نمای قدامی).
 *
 * در نمای روبه‌رو پا به سمتِ بیننده دراز شده، پس آن‌چه دیده می‌شود پهن‌شدنِ
 * پشتِ پا و بعد ردیفِ انگشتان است. خطِ انگشتان به سمتِ بیرون بالا می‌رود، چون
 * انگشتِ شست هم بلندتر است و هم داخلی‌تر.
 */
const FOOT: readonly Pt[] = [
  [35.2, 574],
  [36.6, 585],
  [37.6, 592, 0.55],
  [36.2, 595.2, 0.45], // گوشهٔ انگشتِ کوچک
  [33.4, 595.9],
  [28.6, 595.4],
  [24.4, 596],
  [19.6, 595.6],
  [14.4, 596.3],
  [9.6, 595.6, 0.5],   // برجستگیِ شستِ پا
  [6.6, 591.5, 0.5],
  [5.6, 585],
  [4.4, 578],          // قوسِ کفِ پا — بدونِ آن، پا چکمه دیده می‌شود
  [6.2, 570],
  [8.6, 564],
];

/** قوزکِ داخلی → فاق: لبهٔ داخلیِ پای راست. */
const LEG_MEDIAL: readonly Pt[] = [
  [11, 562],   // قوزکِ داخلی
  [9.4, 546],
  [8, 524],
  [7.6, 500],
  [8.2, 480],
  [9.4, 462],  // برجستگیِ ساقِ داخلی
  [10.6, 448],
  [11, 438],   // زانو از داخل
  [10.6, 420],
[9.8, 398],
  [9.2, 372],
  [8.6, 352],
  [8.8, 342],
  [6.4, 336, 0.5],
  [0, 334, 0.3], // فاق، روی محور
];

// ─── دست ─────────────────────────────────────────────────────────────────────
// دست نمی‌تواند مثل بقیهٔ بدن فقط فهرستی از نقاط باشد: پنج عضوِ هم‌خانواده دارد
// که باید با یک قاعده ساخته شوند.
//
// وضعیت، «آناتومیک» است: کفِ دست رو به جلو، پس شست سمتِ بیرون می‌افتد (استخوانِ
// زند اعلی بیرونی است). ترتیبِ پیمایشِ لبه از مچ به پایین این است:
// شست ← اشاره ← میانی ← انگشتری ← کوچک ← لبهٔ داخلیِ کفِ دست.
//
// نکتهٔ خوانایی: پیکره در حدود ۳۲۰ پیکسل نمایش داده می‌شود، یعنی هر واحدِ بوم
// نیم پیکسل. اگر انگشتان موازی باشند، شکافِ بینشان زیرِ خطِ دور گم می‌شود و
// دست یک پارو دیده می‌شود — همان ایرادِ نسخهٔ قبل. برای همین نوکِ انگشتان از
// ریشه‌شان بازتر است: شکاف از ~۱ واحد در مفصل به بیش از ۵ واحد در نوک می‌رسد.

/** خطِ مفصل‌های کف‌دستی — ریشهٔ هر چهار انگشت. مچ در y=320، نوکِ میانی در ۳۸۴. */
const KNUCKLE_Y = 356;

interface FingerSpec {
  /** محورِ انگشت روی خطِ مفصل. */
  readonly base: number;
  /** محورِ انگشت در نوک — بازتر از ریشه تا شکاف‌ها دیده شوند. */
  readonly tip: number;
  /** ارتفاعِ نوک. */
  readonly tipY: number;
  /** نیم‌پهنا در ریشه و در نوک. */
  readonly baseHalf: number;
  readonly tipHalf: number;
}

const FINGERS: readonly FingerSpec[] = [
  { base: 99.25, tip: 100.5, tipY: 371, baseHalf: 3.05, tipHalf: 2.6 }, // اشاره
  { base: 91.75, tip: 92, tipY: 374, baseHalf: 3.15, tipHalf: 2.7 },    // میانی
  { base: 84.25, tip: 84, tipY: 371, baseHalf: 3.05, tipHalf: 2.6 },    // انگشتری
  { base: 76.75, tip: 76.5, tipY: 365, baseHalf: 2.85, tipHalf: 2.4 },  // کوچک
];

/** جای نمونه‌برداری در طولِ انگشت، و ضریبِ باریک‌شدنِ نوک. */
const FINGER_STOPS: readonly (readonly [t: number, pinch: number])[] = [
  [0, 1],
  [0.45, 1],
  [0.9, 0.96],
  [0.94, 0.6],
];

/** یک انگشت: از لبهٔ بیرونیِ ریشه، دورِ نوک، تا لبهٔ داخلیِ ریشه. */
function fingerPoints(spec: FingerSpec): Pt[] {
  const axis = (t: number) => spec.base + (spec.tip - spec.base) * t;
  const half = (t: number) => spec.baseHalf + (spec.tipHalf - spec.baseHalf) * t;
  const y = (t: number) => KNUCKLE_Y + (spec.tipY - KNUCKLE_Y) * t;

  const lateral: Pt[] = FINGER_STOPS.map(([t, pinch]) => [axis(t) + half(t) * pinch, y(t)]);
  const medial: Pt[] = [...FINGER_STOPS]
    .reverse()
    .map(([t, pinch]) => [axis(t) - half(t) * pinch, y(t)] as Pt);

  return [...lateral, [spec.tip, spec.tipY], ...medial];
}

/** گودیِ بینِ دو انگشت — تیز و بالاتر از خطِ مفصل، وگرنه دو انگشت به هم می‌چسبند. */
function webPoint(outer: FingerSpec, inner: FingerSpec): Pt {
  const gap = (outer.base - outer.baseHalf + inner.base + inner.baseHalf) / 2;
  return [gap, KNUCKLE_Y - 9, 0.25];
}

/**
 * کفِ دست، شست و انگشتان — از لبهٔ بیرونیِ مچ تا لبهٔ داخلیِ مچ.
 *
 * شست کوتاه‌تر از انگشتان است و نوکش بالاتر از خطِ مفصل می‌ایستد؛ همین باعث
 * می‌شود در سیلوئت جدا خوانده شود و با انگشتِ اشاره قاطی نشود.
 */
function handPoints(): Pt[] {
  const points: Pt[] = [
    [97, 328],          // برجستگیِ تنار — ریشهٔ شست
    [101.5, 336],
    [104.5, 345],
    [105.5, 352, 1],    // نوکِ شست (کوتاه‌تر از انگشتان و کمی بالاتر از مفصل)
    [103.5, 359],
    [100.5, 353],
    [98, 346, 0.2],    // گودیِ اولِ بین‌انگشتی
  ];

  FINGERS.forEach((finger, index) => {
    points.push(...fingerPoints(finger));
    const next = FINGERS[index + 1];
    if (next) points.push(webPoint(finger, next));
  });

  points.push(
    [71.5, 368],   // لبهٔ داخلیِ کفِ دست (هیپوتنار)
    [75.5, 345],
    [76, 334],     // لبهٔ داخلیِ مچ
  );

  return points;
}

// ─── زنجیرهٔ کاملِ نیمهٔ راست، با برچسبِ ناحیه ───────────────────────────────
//
// برچسب‌ها از روی *ساختارِ خودِ زنجیره* ساخته می‌شوند، نه دستی روی تک‌تکِ
// نقاط: هر آرایه از قبل یک عضوِ بدن است و ارتفاع، مرزِ داخلِ آن را مشخص
// می‌کند. این‌طور اضافه‌کردنِ یک نقطهٔ تازه به آرایه‌ها هیچ چیزی را نمی‌شکند.

interface Tagged {
  readonly dx: number;
  readonly y: number;
  readonly smooth: number | undefined;
  readonly region: Region;
}

const band = (y: number, edges: readonly (readonly [number, Region])[], last: Region): Region => {
  for (const [limit, region] of edges) if (y < limit) return region;
  return last;
};

const tag = (points: readonly Pt[], of: (y: number) => Region): Tagged[] =>
  points.map(([dx, y, smooth]) => ({ dx, y, smooth, region: of(y) }));

const HALF_TAGGED: readonly Tagged[] = [
  ...tag(HEAD_TO_SHOULDER, (y) => band(y, [[85, "head"], [99, "neck"]], "shoulder")),
  ...tag(ARM_LATERAL, (y) => band(y, [[233, "upperArm"]], "forearm")),
  ...tag(handPoints(), () => "hand"),
  ...tag(ARM_MEDIAL, (y) => band(y, [[233, "upperArm"]], "forearm")),
  ...tag(TORSO_TO_ANKLE, (y) =>
    band(
      y,
      [
        [200, "chest"],
        [260, "waist"],
        [319, "hip"],
        [400, "thighOuter"],
        [462, "knee"],
        [540, "calf"],
      ],
      "ankle",
    ),
  ),
  ...tag(FOOT, () => "foot"),
  // لبهٔ داخلیِ پا از قوزک به بالا پیموده می‌شود؛ همه‌اش «ران داخلی» برچسب
  // می‌خورد و در مرحلهٔ اعمال، هرچه به قوزک نزدیک‌تر شود اثرش کم‌رنگ‌تر است.
  ...tag(LEG_MEDIAL, () => "thighInner"),
];



// ─── نیم‌پهنای تنه (بدونِ بازوها) ───────────────────────────────────────────

/**
 * دیوارهٔ «تنه» بر حسب ارتفاع — همان چیزی که موتورِ ریخت‌دهی برای تشخیصِ مرزِ
 * تنه و اندام لازم دارد.
 *
 * تا پیش از زیربغل بازو از تنه جدا نیست، پس در آن بازه همان لبهٔ بیرونیِ
 * سیلوئت (شانه و دلتوئید) ملاک است؛ از y≈۱۷۰ به بعد روی دیوارهٔ قفسهٔ سینه
 * می‌افتد. افتِ بینِ این دو روی ~۲۰ واحد پخش شده تا مشتقِ نگاشت پیوسته بماند.
 */
const CORE_WALL: readonly (readonly [dx: number, y: number])[] = [
  [0, 0], [9.2, 6.9], [17.6, 11.4], [23.2, 19], [25.8, 30], [26.3, 42],
  [25.6, 52], [23.6, 62], [20.6, 70], [19.4, 78], [19.2, 88], [20.5, 96],
  [28, 101], [38, 106], [50, 110.5], [60, 114], [67, 119], [74, 127],
  [79.6, 140], [80.8, 152], [82.4, 166],
  [66, 174], [52, 182],
  [50.8, 186], [51, 196], [50.4, 210], [48.4, 220], [46.4, 230], [46.6, 244],
  [48, 258], [51, 272], [55, 285], [57.8, 296], [57.6, 308], [57.2, 318],
];

/** آخرین ارتفاعی که «تنه» معنا دارد؛ پایین‌ترش دو پای جداست. */
const CORE_LAST_Y = 318;

function buildCoreTable(): number[] {
  const last = CORE_WALL.length - 1;
  const table: number[] = [];

  for (let y = 0; y <= 596; y += CORE_HALF_STEP) {
    if (y > CORE_LAST_Y) {
      table.push(0);
      continue;
    }
    let value = (CORE_WALL[last] as readonly [number, number])[0];
    for (let i = 0; i < last; i += 1) {
      const a = CORE_WALL[i] as readonly [number, number];
      const b = CORE_WALL[i + 1] as readonly [number, number];
      if (y <= b[1]) {
        value = y <= a[1] ? a[0] : a[0] + ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]);
        break;
      }
    }
    table.push(Number(value.toFixed(2)));
  }

  return table;
}

const CORE_HALF_MALE: readonly number[] = buildCoreTable();

type Node = readonly [value: number, y: number];

/**
 * تفاوتِ نسبت‌های زنانه، به‌صورت ضریبِ پهنا بر حسب ارتفاع.
 *
 * چرا این‌جا و نه در موتورِ وارپ: تفاوتِ زن و مرد یک ویژگیِ «شکلِ مرجع» است نه
 * یک تغییرِ ناشی از قد و وزن. با آوردنش به این‌جا، ضرایبِ چاقی/لاغری روی هر دو
 * پیکره یکسان عمل می‌کنند و نتیجه پیش‌بینی‌پذیر می‌ماند.
 */
const FEMALE_WIDTH: readonly Node[] = [
  [0.95, 0],
  [0.955, 84],
  [0.93, 106],
  [0.905, 120],
  [0.9, 142],
  [0.925, 162],
  [0.95, 177],
  [0.865, 230],
  [1.045, 268],
  [1.145, 299],
  [1.135, 320],
  [1.075, 376],
  [0.995, 432],
  [0.955, 523],
  [0.93, 600],
];

/** برجستگیِ سینه — فقط روی لبهٔ تنه، نه روی بازویی که هم‌ارتفاعِ آن است. */
const BUST = { center: 176, spread: 24, amount: 5 } as const;

// ─── ابزارِ عددی ─────────────────────────────────────────────────────────────

const at = (values: readonly number[], index: number): number => values[index] as number;

/** درون‌یابیِ خطیِ جدولِ [مقدار, ارتفاع] که بر حسب ارتفاع مرتب است. */
function sampler(nodes: readonly Node[]): (y: number) => number {
  const last = nodes.length - 1;
  return (y: number): number => {
    const first = nodes[0] as Node;
    if (y <= first[1]) return first[0];
    const tail = nodes[last] as Node;
    if (y >= tail[1]) return tail[0];
    for (let i = 0; i < last; i += 1) {
      const a = nodes[i] as Node;
      const b = nodes[i + 1] as Node;
      if (y <= b[1]) return a[0] + ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]);
    }
    return tail[0];
  };
}

/** نیم‌پهنای تنه در ارتفاعِ `y` روی جدولِ مردانه (درون‌یابیِ خطی). */
function maleCoreHalf(y: number): number {
  const position = y / CORE_HALF_STEP;
  const index = Math.floor(position);
  if (index < 0) return at(CORE_HALF_MALE, 0);
  if (index >= CORE_HALF_MALE.length - 1) return at(CORE_HALF_MALE, CORE_HALF_MALE.length - 1);
  const t = position - index;
  return at(CORE_HALF_MALE, index) * (1 - t) + at(CORE_HALF_MALE, index + 1) * t;
}

// ─── ساختِ سیلوئت ────────────────────────────────────────────────────────────

/** ناحیه‌هایی که قانونِ «جابه‌جاییِ صُلب» را می‌گیرند، نه ضربِ ساده را. */
const ARM_REGIONS: ReadonlySet<Region> = new Set<Region>(["upperArm", "forearm", "hand"]);

const smoothStep01 = (value: number, a: number, b: number): number => {
  const t = Math.max(0, Math.min(1, (value - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const clamp01 = (t: number): number => (t < 0 ? 0 : t > 1 ? 1 : t);

/** محورِ طولیِ بازو: از (۶۰, ۱۲۴) تا (۸۶, ۳۲۰)، پایین‌ترش ثابت. */
function armAxisAt(y: number): number {
  return 60 + clamp01((y - 124) / (320 - 124)) * 26;
}

/** ضریبِ پهنای دیوارهٔ تنه در ارتفاعِ `y` (برای جابه‌جاییِ بازو و جدولِ تنه). */
function torsoFactorAt(factors: ShapeFactors, y: number): number {
  const nodes: readonly Node[] = [
    [factors.head, 60],
    [factors.neck, 92],
    [factors.shoulder, 118],
    [factors.shoulder, 160],
    [factors.chest, 190],
    [factors.waist, 232],
    [factors.hip, 296],
    [factors.hip, 318],
  ];
  return sampler(nodes)(y);
}

/**
 * جابه‌جاییِ افقیِ *ثابتِ* بازو.
 *
 * برابرِ بیشترین بیرون‌آمدگیِ دیوارهٔ تنه در تمامِ طولی که بازو کنارش می‌ایستد.
 * چون یک عددِ ثابت است، بازو فقط جابه‌جا می‌شود و کاملاً صاف می‌ماند؛ و چون
 * *بیشینه* است، هیچ‌جا داخلِ شکم فرو نمی‌رود. بهایش یک شکافِ زیربغلِ کمی بازتر
 * است که به‌مراتب از بازوی خمیده بهتر است.
 */
function armShiftOf(
  factors: ShapeFactors,
  sexScale: (y: number) => number,
): number {
  let shift = 0;
  for (let y = 174; y <= 318; y += 4) {
    const wall = maleCoreHalf(y) * sexScale(y);
    shift = Math.max(shift, wall * torsoFactorAt(factors, y) - wall);
  }
  return shift;
}

/**
 * ضریبِ هر نقطه در طولِ زنجیره، هموارشده.
 *
 * ضریب‌ها ناحیه‌به‌ناحیه تعریف شده‌اند، پس روی مرزِ دو ناحیه می‌پرند و منحنیِ
 * Catmull-Rom آن پرش را به شکلِ یک گوشهٔ تیز نشان می‌دهد. چند پاسِ میانگینِ
 * سه‌نقطه‌ای مرز را نرم می‌کند. نواحیِ متضاد (ران داخلی و بیرونی) در زنجیره
 * فاصلهٔ زیادی دارند — زانو، ساق، قوزک و کفِ پا بینشان است — پس این هموارسازی
 * هیچ‌وقت آن دو را با هم قاطی نمی‌کند.
 */
function smoothedFactors(factors: ShapeFactors): number[] {
  let values = HALF_TAGGED.map(({ region, y }) => {
    const raw = factors[region];
    if (region !== "thighInner") return raw;
    // لبهٔ داخلی: اثرِ چسبیدنِ ران‌ها هرچه به قوزک نزدیک‌تر شویم کم‌رنگ‌تر
    // می‌شود — ساق و قوزک مثل ران به هم نمی‌چسبند.
    return raw + (1 - raw) * smoothStep01(y, 400, 548);
  });

  for (let pass = 0; pass < 3; pass += 1) {
    const next = values.slice();
    for (let i = 1; i < values.length - 1; i += 1) {
      next[i] = 0.25 * values[i - 1]! + 0.5 * values[i]! + 0.25 * values[i + 1]!;
    }
    values = next;
  }
  return values;
}

// ─── ساختِ سیلوئت ────────────────────────────────────────────────────────────

function buildOutline(sex: BodySex, factors: ShapeFactors): BaseOutline {
  const female = sex === "female";
  const femaleScale = sampler(FEMALE_WIDTH);
  /** ضریبِ زنانه فقط روی تنه و پا معنا دارد؛ روی بازو حساب نمی‌شود. */
  const sexScale = (y: number): number => (female ? femaleScale(y) : 1);
  const weights = smoothedFactors(factors);
  const armShift = armShiftOf(factors, sexScale);

  /**
   * نقطهٔ نشانهٔ شمارهٔ `i` بعد از اعمالِ ریخت.
   *
   * بازو قانونِ خودش را دارد: ضخامتش حولِ محورِ *خودِ بازو* عوض می‌شود و بعد
   * یک‌جا جابه‌جا می‌شود. اگر مثل بقیهٔ بدن در ضریب ضرب شود، هر نقطه به‌نسبتِ
   * فاصله‌اش از مرکز بیرون می‌رود؛ یعنی مچ خیلی بیشتر از شانه حرکت می‌کند و
   * بازو باز و کج دیده می‌شود.
   */
  const shaped = (i: number): number => {
    const point = HALF_TAGGED[i]!;
    const weight = weights[i]!;
    const torso = point.dx * weight * sexScale(point.y);

    // «بازو بودن» از برچسبِ ناحیه می‌آید، نه از ارتفاع: پا و دست در بازهٔ
    // ارتفاعیِ مشترکی هستند و هر شرطی که فقط به y نگاه کند، قانونِ بازو را به
    // ران هم اعمال می‌کند و سیلوئت خودش را قطع می‌کند.
    const armness = ARM_REGIONS.has(point.region)
      ? smoothStep01(point.y, 174, 205)
      : 0;
    if (armness <= 0) return torso;

    // بازو: ضخامت حولِ محورِ خودش، بعد یک جابه‌جاییِ ثابت. نه ضریبِ زنانه
    // می‌گیرد و نه هیچ چیزِ دیگری که تابعِ ارتفاع باشد — وگرنه خم می‌شود.
    const axis = armAxisAt(point.y);
    const arm = axis + (point.dx - axis) * weight + armShift;
    return torso + (arm - torso) * armness;
  };

  /**
   * برجستگیِ سینه فقط به نقاطی اضافه می‌شود که روی لبهٔ تنه‌اند؛ نقاطِ بازو در
   * همان ارتفاع باید دست‌نخورده بمانند، وگرنه بازو هم باد می‌کند.
   */
  const dxOf = (dx: number, y: number, region: Region): number => {
    if (!female || ARM_REGIONS.has(region)) return dx;
    if (dx > maleCoreHalf(y) * sexScale(y) + 2) return dx;
    return dx + BUST.amount * Math.exp(-(((y - BUST.center) / BUST.spread) ** 2));
  };

  const chain: readonly Pt[] = HALF_TAGGED.map(({ y, smooth, region }, i) => {
    const dx = dxOf(shaped(i), y, region);
    return (smooth === undefined ? [dx, y] : [dx, y, smooth]) as Pt;
  });

  const shapedPath = toCubics(chain);
  const count = (shapedPath.length - 2) / 6;
  const point = (k: number): [number, number] => [
    at(shapedPath, k * 2),
    at(shapedPath, k * 2 + 1),
  ];

  const right = (dx: number, y: number) => `${(CENTER_X + dx).toFixed(2)},${y.toFixed(2)}`;
  const left = (dx: number, y: number) => `${(CENTER_X - dx).toFixed(2)},${y.toFixed(2)}`;

  const start = point(0);
  let path = `M${right(start[0], start[1])}`;

  // نیمهٔ راست: همان منحنی‌های مرجع
  for (let s = 0; s < count; s += 1) {
    const c1 = point(s * 3 + 1);
    const c2 = point(s * 3 + 2);
    const p = point(s * 3 + 3);
    path += `C${right(c1[0], c1[1])} ${right(c2[0], c2[1])} ${right(p[0], p[1])}`;
  }

  // نیمهٔ چپ: همان منحنی‌ها، معکوس و قرینه (پایان و آغاز روی محورند، پس درز
  // دیده نمی‌شود)
  for (let s = count - 1; s >= 0; s -= 1) {
    const c2 = point(s * 3 + 2);
    const c1 = point(s * 3 + 1);
    const p = point(s * 3);
    path += `C${left(c2[0], c2[1])} ${left(c1[0], c1[1])} ${left(p[0], p[1])}`;
  }

  const coreHalf = CORE_HALF_MALE.map((value, index) => {
    const y = index * CORE_HALF_STEP;
    return value * torsoFactorAt(factors, y) * sexScale(y);
  });

  return { path: `${path}Z`, coreHalf };
}

const cache = new Map<string, BaseOutline>();

/** سیلوئتِ متقارن برای یک جنسیت و یک ریخت (کش‌شده). */
export function getBaseOutline(
  sex: BodySex,
  factors: ShapeFactors,
  key: string,
): BaseOutline {
  const cacheKey = `${sex}|${key}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;
  const built = buildOutline(sex, factors);
  cache.set(cacheKey, built);
  return built;
}

/** نیم‌پهنای تنهٔ *مرجع* (مردِ BMI≈۲۲) — مبنای سنجشِ اینکه تنه چقدر پهن‌تر شده. */
export function referenceCoreHalfAt(y: number): number {
  return maleCoreHalf(y);
}

/** نیم‌پهنای تنه در ارتفاعِ `y` با درون‌یابیِ جدول. */
export function coreHalfFrom(table: readonly number[], y: number): number {
  const position = y / CORE_HALF_STEP;
  const index = Math.floor(position);
  if (index < 0) return at(table, 0);
  if (index >= table.length - 1) return at(table, table.length - 1);
  const t = position - index;
  return at(table, index) * (1 - t) + at(table, index + 1) * t;
}
