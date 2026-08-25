// src/design-system/illustrations/anatomy/body-keyframes.ts
// ─────────────────────────────────────────────────────────────────────────────
// کلیدفریم‌های ریختِ بدن.
//
// چرا کلیدفریم و نه وارپ:
//   نسخهٔ پیشین یک «میدانِ وارپِ شعاعی» بود: هر نقطه فقط بر اساس فاصله‌اش تا
//   محورِ تقارن و ارتفاعش جابه‌جا می‌شد. چنین میدانی ذاتاً نمی‌تواند دو چیزِ
//   هم‌ارتفاع را جدا حساب کند — مثلاً «لبهٔ بیرونیِ ران باید بیرون برود ولی
//   لبهٔ داخلی تو بیاید»، یا «بازو باید جابه‌جا شود نه کشیده». نتیجه‌اش بازوی
//   کج، ران‌های واگرا و اندام‌هایی بود که از بدن می‌زدند بیرون. هر پارامترِ
//   تازه هم یک حالتِ خرابِ تازه می‌ساخت.
//
//   حالا برای هر ناحیهٔ بدن، در چند BMIِ کلیدی، یک عددِ دستی تعریف شده است.
//   شکلِ نهایی درون‌یابیِ خطیِ بینِ دو کلیدفریمِ مجاور است. چون هر کلیدفریم
//   خودش یک بدنِ معتبر است، هر خروجی هم ترکیبِ محدبِ بدن‌های معتبر است و
//   ریاضیاً نمی‌تواند حالتِ غیرممکن بسازد.
//
// اعداد ضریبِ پهنا نسبت به سیلوئتِ مرجع‌اند (مرجع = مردِ BMI≈۲۲).
// ─────────────────────────────────────────────────────────────────────────────

export type Region =
  | "head"
  | "neck"
  | "shoulder"
  | "chest"
  | "waist"
  | "hip"
  | "thighOuter"
  | "thighInner"
  | "knee"
  | "calf"
  | "ankle"
  | "foot"
  | "upperArm"
  | "forearm"
  | "hand";

export type ShapeFactors = Readonly<Record<Region, number>>;

interface Keyframe {
  readonly bmi: number;
  readonly factors: ShapeFactors;
}

/**
 * چهار کلیدفریمِ مردانه.
 *
 * نکتهٔ کلیدی `thighInner` است: با چاق‌شدن *کم* می‌شود، یعنی لبهٔ داخلیِ ران به
 * محورِ بدن نزدیک می‌شود و دو ران به هم می‌چسبند — چیزی که هیچ ضریبِ شعاعیِ
 * واحدی نمی‌توانست بسازد، چون همان ضریب لبهٔ بیرونی را هم بیرون می‌برد.
 *
 * `waist` همیشه بیش از `chest` رشد می‌کند: چاقیِ مردانه شکمی است.
 */
const MALE_KEYFRAMES: readonly Keyframe[] = [
  {
    bmi: 16,
    factors: {
      head: 1,
      neck: 0.9,
      shoulder: 0.93,
      chest: 0.87,
      waist: 0.8,
      hip: 0.88,
      thighOuter: 0.84,
      thighInner: 1.45,
      knee: 0.93,
      calf: 0.86,
      ankle: 0.95,
      foot: 0.98,
      upperArm: 0.82,
      forearm: 0.86,
      hand: 0.94,
    },
  },
  {
    bmi: 22,
    factors: {
      head: 1,
      neck: 1,
      shoulder: 1,
      chest: 1,
      waist: 1,
      hip: 1,
      thighOuter: 1,
      thighInner: 1,
      knee: 1,
      calf: 1,
      ankle: 1,
      foot: 1,
      upperArm: 1,
      forearm: 1,
      hand: 1,
    },
  },
  {
    bmi: 30,
    factors: {
      head: 1.01,
      neck: 1.11,
      shoulder: 1.07,
      chest: 1.16,
      waist: 1.32,
      hip: 1.17,
      thighOuter: 1.16,
      thighInner: 0.5,
      knee: 1.07,
      calf: 1.12,
      ankle: 1.03,
      foot: 1.02,
      upperArm: 1.16,
      forearm: 1.11,
      hand: 1.03,
    },
  },
  {
    bmi: 40,
    factors: {
      head: 1.02,
      neck: 1.24,
      shoulder: 1.15,
      chest: 1.38,
      waist: 1.68,
      hip: 1.36,
      thighOuter: 1.36,
      thighInner: 0.16,
      knee: 1.17,
      calf: 1.24,
      ankle: 1.08,
      foot: 1.05,
      upperArm: 1.33,
      forearm: 1.22,
      hand: 1.06,
    },
  },
];

/**
 * تفاوتِ پاسخِ زنانه به وزن، به‌صورت ضریب روی *انحراف از ۱*.
 *
 * شکلِ پایهٔ زنانه از قبل در `FEMALE_WIDTH` پخته شده؛ این‌جا فقط گفته می‌شود
 * که با اضافه‌وزن، لگن و ران بیشتر از شکم رشد می‌کنند (توزیعِ گیناکوئید).
 */
const FEMALE_RESPONSE: Partial<Record<Region, number>> = {
  waist: 0.85,
  chest: 0.9,
  // پهنای لگنِ زنانه از قبل در شکلِ پایه هست (`FEMALE_WIDTH`). اگر *پاسخ به
  // وزن* را هم بزرگ کنیم، دو اثر روی هم سوار می‌شوند و پیکره کاریکاتور
  // می‌شود. پس این‌جا فقط کمی بیشتر از مرد، نه بیشتر.
  hip: 1.05,
  thighOuter: 1.08,
  thighInner: 1.1,
  shoulder: 0.85,
  neck: 0.9,
};

const REGIONS = Object.keys(MALE_KEYFRAMES[1]!.factors) as readonly Region[];

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/**
 * ضرایبِ ریخت برای یک BMI.
 *
 * بیرونِ بازهٔ کلیدفریم‌ها *برون‌یابی نمی‌کنیم*؛ به نزدیک‌ترین کلیدفریم گیر
 * می‌کند. برون‌یابی همان دری است که حالت‌های غیرممکن از آن وارد می‌شوند، و
 * تفاوتِ دیداریِ BMI ۴۰ و ۹۰ هم عملاً چیزی به کاربر نمی‌گوید.
 */
export function shapeFactorsAt(bmi: number, female: boolean): ShapeFactors {
  const frames = MALE_KEYFRAMES;
  const first = frames[0]!;
  const last = frames[frames.length - 1]!;

  let lo = first;
  let hi = first;
  let t = 0;

  if (bmi <= first.bmi) {
    lo = first;
    hi = first;
  } else if (bmi >= last.bmi) {
    lo = last;
    hi = last;
  } else {
    for (let i = 0; i < frames.length - 1; i += 1) {
      const a = frames[i]!;
      const b = frames[i + 1]!;
      if (bmi <= b.bmi) {
        lo = a;
        hi = b;
        t = (bmi - a.bmi) / (b.bmi - a.bmi);
        break;
      }
    }
  }

  const out = {} as Record<Region, number>;
  for (const region of REGIONS) {
    const value = lerp(lo.factors[region], hi.factors[region], t);
    if (!female) {
      out[region] = value;
      continue;
    }
    const response = FEMALE_RESPONSE[region] ?? 1;
    out[region] = 1 + (value - 1) * response;
  }
  return out;
}

/** کلیدِ کش: ضرایب را به گامِ ۰٫۰۱ گرد می‌کند تا رندرهای متوالی یکی شوند. */
export function factorsKey(factors: ShapeFactors): string {
  return REGIONS.map((region) => Math.round(factors[region] * 100)).join(",");
}
