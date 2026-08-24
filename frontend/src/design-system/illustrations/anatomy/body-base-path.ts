// src/design-system/illustrations/anatomy/body-base-path.ts
// ─────────────────────────────────────────────────────────────────────────────
// هندسهٔ مرجعِ پیکرهٔ انسان — ساختِ پارامتریِ سیلوئت.
//
// چرا دیگر از مسیرِ ترسیمیِ آماده استفاده نمی‌کنیم:
//   سیلوئتِ قبلی از یک تصویرِ دست‌کشیده وکتور شده بود؛ نیمهٔ چپ و راستش دقیقاً
//   قرینه نبود. با «وارپ» شدن (چاق/لاغر/کوتاه/بلند) آن اختلافِ کوچک بزرگ‌نمایی
//   می‌شد و دست و پا کج به‌نظر می‌رسید.
//
//   این‌جا فقط نیمهٔ راستِ بدن تعریف می‌شود و نیمهٔ چپ، آینهٔ ریاضیِ همان است.
//   پس تقارن نه «تقریبی» که «ذاتی» است و هیچ ترکیبی از قد/وزن/سن نمی‌تواند
//   آن را به‌هم بزند (نگاشتِ وارپ هم روی |x - CENTER_X| کار می‌کند و قرینگی را
//   حفظ می‌کند).
//
// خروجی برای هر جنسیت یک‌بار ساخته و کش می‌شود.
// ─────────────────────────────────────────────────────────────────────────────

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

// ─── نقاطِ تعریفِ نیمهٔ راست ──────────────────────────────────────────────────
// هر گره: [y, نیم‌پهنا]. مبدأ نیم‌پهنا محورِ تقارن است.
// اعداد برای بزرگسالِ مرجع تنظیم شده‌اند: تارک ۶، کفِ پا ۵۹۵، سر ۶۶ واحد.

type Node = readonly [y: number, half: number];

/** سر، گردن و شانه — تا نقطه‌ای که بازو از آن آویزان می‌شود. */
const HEAD_TO_SHOULDER: readonly Node[] = [
  [6, 0],
  [7.5, 10],
  [13, 19],
  [22, 26],
  [33, 29],
  [46, 29],
  [56, 25.5],
  [64, 19],
  [70, 14],
  [78, 12],
  [88, 11.5],
  [96, 14],
  [102, 24],
  [107, 36],
];

/** لبهٔ بیرونیِ بازو، از سرشانه تا نوکِ انگشتان. */
const ARM_OUTER: readonly Node[] = [
  [113, 50],
  [121, 61],
  [133, 66],
  [160, 67],
  [200, 66],
  [240, 65],
  [280, 63],
  [310, 61],
  [322, 61],
  [334, 66],
  [348, 66],
  [362, 61],
  [370, 53],
];

/** لبهٔ درونیِ بازو، از نوکِ انگشتان تا زیرِ بغل. */
const ARM_INNER: readonly Node[] = [
  [366, 47],
  [352, 55],
  [338, 58],
  [326, 57],
  [316, 53],
  [300, 51],
  [275, 52],
  [250, 54],
  [222, 53],
  [205, 50],
  [188, 46],
];

/** تنه، از زیرِ بغل تا بالای ران. */
const TORSO: readonly Node[] = [
  [200, 46],
  [225, 44.5],
  [250, 42.5],
  [275, 44],
  [295, 47.5],
  [312, 50.5],
  [332, 50.5],
  [352, 48],
];

/** لبهٔ بیرونیِ پا، از ران تا مچ. */
const LEG_OUTER: readonly Node[] = [
  [380, 44],
  [420, 38],
  [455, 32],
  [485, 30],
  [515, 23],
  [545, 16.5],
  [566, 15],
];

/** کفِ پا — گوشه‌ها عمداً تیزند تا پا «پا» دیده شود. */
const FOOT: readonly Node[] = [
  [578, 16],
  [589, 18.5],
  [594, 20],
  [595, 18],
  [595, 7],
  [593, 5],
];

/** لبهٔ درونیِ پا، از مچ تا فاق. */
const LEG_INNER: readonly Node[] = [
  [578, 5.5],
  [548, 8.5],
  [510, 11],
  [470, 13.5],
  [430, 16.5],
  [395, 19],
  [370, 18],
  [355, 12],
  [345, 3],
  [343, 0],
];

/**
 * تفاوتِ نسبت‌های زنانه، به‌صورت ضریبِ پهنا بر حسب ارتفاع.
 *
 * چرا این‌جا و نه در موتورِ وارپ: تفاوتِ زن و مرد یک ویژگیِ «شکلِ مرجع» است نه
 * یک تغییرِ ناشی از قد و وزن. با آوردنش به این‌جا، ضرایبِ چاقی/لاغری روی هر دو
 * پیکره یکسان عمل می‌کنند و نتیجه پیش‌بینی‌پذیر می‌ماند.
 */
const FEMALE_WIDTH: readonly Node[] = [
  [0, 0.95],
  [70, 0.955],
  [95, 0.93],
  [112, 0.875],
  [150, 0.895],
  [185, 0.925],
  [205, 0.95],
  [250, 0.865],
  [285, 1.045],
  [315, 1.145],
  [345, 1.135],
  [400, 1.075],
  [455, 0.995],
  [520, 0.955],
  [600, 0.93],
];

/** برجستگیِ سینه — افزوده روی لبهٔ تنه، فقط در بازهٔ قفسهٔ سینه. */
const BUST = { center: 196, spread: 26, amount: 5.4 } as const;

// ─── ابزارِ عددی ─────────────────────────────────────────────────────────────

const at = (values: readonly number[], index: number): number => values[index] as number;

/** درون‌یابیِ خطیِ یک جدولِ [x, y] مرتب. */
function sampler(nodes: readonly Node[]): (x: number) => number {
  const last = nodes.length - 1;
  return (x: number): number => {
    const first = nodes[0] as Node;
    if (x <= first[0]) return first[1];
    const tail = nodes[last] as Node;
    if (x >= tail[0]) return tail[1];
    for (let i = 0; i < last; i += 1) {
      const a = nodes[i] as Node;
      const b = nodes[i + 1] as Node;
      if (x <= b[0]) {
        const t = (x - a[0]) / (b[0] - a[0]);
        return a[1] + (b[1] - a[1]) * t;
      }
    }
    return tail[1];
  };
}

/**
 * اسپلاینِ کاتمول-رومِ «مرکزگرا» (alpha = ۰٫۵) روی یک حلقهٔ بسته.
 *
 * چرا مرکزگرا: نسخهٔ یکنواخت وقتی فاصلهٔ نقاط ناهمگون است (مثل نوکِ انگشتان
 * کنارِ ساعدِ بلند) حلقه و گره می‌زند. مرکزگرا تضمین می‌کند منحنی از خودش
 * عبور نکند — دقیقاً چیزی که برای یک سیلوئتِ بسته لازم است.
 */
function closedCatmullRom(points: readonly (readonly [number, number])[]): string {
  const n = points.length;
  const get = (i: number) => points[((i % n) + n) % n] as readonly [number, number];
  const dist = (a: readonly [number, number], b: readonly [number, number]) =>
    Math.max(Math.hypot(b[0] - a[0], b[1] - a[1]), 1e-6) ** 0.5;

  const fmt = (value: number) => value.toFixed(2);
  const first = get(0);
  let d = `M${fmt(first[0])},${fmt(first[1])}`;

  for (let i = 0; i < n; i += 1) {
    const p0 = get(i - 1);
    const p1 = get(i);
    const p2 = get(i + 1);
    const p3 = get(i + 2);

    const d1 = dist(p0, p1);
    const d2 = dist(p1, p2);
    const d3 = dist(p2, p3);

    // نقاطِ کنترل از مماسِ کاتمول-رومِ ناهم‌فاصله؛ ضریبِ ۱/۳ همان تبدیلِ
    // استانداردِ هرمیت به بزیهٔ مکعبی است.
    const k1 = d2 / (3 * (d1 + d2));
    const k2 = d2 / (3 * (d2 + d3));

    const c1: [number, number] = [p1[0] + (p2[0] - p0[0]) * k1, p1[1] + (p2[1] - p0[1]) * k1];
    const c2: [number, number] = [p2[0] - (p3[0] - p1[0]) * k2, p2[1] - (p3[1] - p1[1]) * k2];

    d += `C${fmt(c1[0])},${fmt(c1[1])} ${fmt(c2[0])},${fmt(c2[1])} ${fmt(p2[0])},${fmt(p2[1])}`;
  }

  return `${d}Z`;
}

// ─── ساختِ سیلوئت ────────────────────────────────────────────────────────────

/** نیم‌پهنای تنه (بدونِ بازو) در هر ارتفاع، برای یک جنسیت. */
function coreProfile(sex: BodySex): (y: number) => number {
  const nodes: readonly Node[] = [
    ...HEAD_TO_SHOULDER,
    [113, 43],
    [150, 44.5],
    [183, 45.5],
    ...TORSO,
    ...LEG_OUTER,
    ...FOOT.slice(0, 3),
  ];
  const base = sampler(nodes);
  const femaleScale = sampler(FEMALE_WIDTH);

  return (y: number): number => {
    const half = base(y);
    if (sex !== "female") return half;
    const bust = BUST.amount * Math.exp(-(((y - BUST.center) / BUST.spread) ** 2));
    return half * femaleScale(y) + (y > 150 && y < 250 ? bust : 0);
  };
}

/** گره‌های نیمهٔ راست پس از اعمالِ تناسب‌های جنسیتی. */
function rightHalf(sex: BodySex): (readonly [number, number])[] {
  const femaleScale = sampler(FEMALE_WIDTH);
  const core = coreProfile(sex);

  const shape = (node: Node): [number, number] => {
    const [y, half] = node;
    const scaled = sex === "female" ? half * femaleScale(y) : half;
    return [CENTER_X + scaled, y];
  };

  // تنه و سر از پروفایلِ تنه می‌آیند تا لبهٔ دیده‌شده و جدولِ نیم‌پهنا هرگز
  // از هم جدا نیفتند (وگرنه بازو موقعِ چاق‌شدن روی شکم می‌رود).
  const fromCore = (y: number): [number, number] => [CENTER_X + core(y), y];

  return [
    ...HEAD_TO_SHOULDER.map((node) => fromCore(node[0])),
    ...ARM_OUTER.map(shape),
    ...ARM_INNER.map(shape),
    ...TORSO.map((node) => fromCore(node[0])),
    ...LEG_OUTER.map((node) => fromCore(node[0])),
    ...FOOT.map(shape),
    ...LEG_INNER.map(shape),
  ];
}

function buildOutline(sex: BodySex): BaseOutline {
  const right = rightHalf(sex);

  // آینه: نیمهٔ چپ دقیقاً همان نقاط است با علامتِ معکوس. نقطهٔ آغاز (تارک) و
  // پایان (فاق) روی محورند و تکرار نمی‌شوند تا حلقه گره نخورد.
  const mirrored = right
    .slice(1, right.length - 1)
    .reverse()
    .map(([x, y]): [number, number] => [CENTER_X - (x - CENTER_X), y]);

  const path = closedCatmullRom([...right, ...mirrored]);

  const core = coreProfile(sex);
  const coreHalf: number[] = [];
  for (let y = 0; y <= 600; y += CORE_HALF_STEP) coreHalf.push(core(y));

  return { path, coreHalf };
}

const cache = new Map<BodySex, BaseOutline>();

/** سیلوئتِ مرجعِ متقارن برای یک جنسیت (کش‌شده). */
export function getBaseOutline(sex: BodySex): BaseOutline {
  const cached = cache.get(sex);
  if (cached) return cached;
  const built = buildOutline(sex);
  cache.set(sex, built);
  return built;
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
