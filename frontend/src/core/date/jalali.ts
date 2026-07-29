/**
 * Jalali (Persian) calendar helpers.
 *
 * The backend derives age with `int(birth_date[:4])` compared against
 * `jdatetime.date.today().year`, i.e. it expects a **Jalali** year. So the UI
 * collects a Jalali date directly rather than converting a Gregorian one, and
 * these helpers exist to build a correct, validated Jalali date picker.
 */

export interface JalaliDateParts {
  readonly year: number;
  readonly month: number;
  readonly day: number;
}

export const JALALI_MONTH_NAMES = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
] as const;

/**
 * Leap years follow the 33-year cycle. This remainder set is exact for the
 * range a birth-date picker can produce (roughly 1300–1470), which is all we
 * need — a general-purpose implementation would require the full Birashk
 * cycle arithmetic.
 */
const LEAP_REMAINDERS = new Set([1, 5, 9, 13, 17, 22, 26, 30]);

export const isJalaliLeapYear = (year: number): boolean =>
  LEAP_REMAINDERS.has(((year % 33) + 33) % 33);

/** Months 1–6 have 31 days, 7–11 have 30, and Esfand has 29 or 30. */
export const jalaliMonthLength = (year: number, month: number): number => {
  if (month <= 6) return 31;
  if (month <= 11) return 30;
  return isJalaliLeapYear(year) ? 30 : 29;
};

/** Reads today's Jalali date from the platform's Persian calendar. */
export const todayJalali = (): JalaliDateParts => {
  const parts = new Intl.DateTimeFormat("en-u-ca-persian", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    timeZone: "Asia/Tehran",
  }).formatToParts(new Date());

  const read = (type: Intl.DateTimeFormatPartTypes): number =>
    Number(parts.find((part) => part.type === type)?.value ?? Number.NaN);

  return { year: read("year"), month: read("month"), day: read("day") };
};

export const isValidJalaliDate = ({ year, month, day }: JalaliDateParts): boolean =>
  Number.isInteger(year) &&
  Number.isInteger(month) &&
  Number.isInteger(day) &&
  month >= 1 &&
  month <= 12 &&
  day >= 1 &&
  day <= jalaliMonthLength(year, month);

/**
 * Serialises to `YYYY-MM-DD` using ASCII digits — the backend slices the first
 * four characters and calls `int()` on them, so Persian digits would crash it.
 */
export const formatJalaliIso = ({ year, month, day }: JalaliDateParts): string =>
  `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

export const parseJalaliIso = (value: string): JalaliDateParts | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const parts = {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };

  return isValidJalaliDate(parts) ? parts : null;
};
