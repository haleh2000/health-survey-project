
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


const LEAP_REMAINDERS = new Set([1, 5, 9, 13, 17, 22, 26, 30]);

export const isJalaliLeapYear = (year: number): boolean =>
  LEAP_REMAINDERS.has(((year % 33) + 33) % 33);

export const jalaliMonthLength = (year: number, month: number): number => {
  if (month <= 6) return 31;
  if (month <= 11) return 30;
  return isJalaliLeapYear(year) ? 30 : 29;
};

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

export const gregorianToJalali = (date: Date | string): JalaliDateParts => {
  const d = typeof date === "string" ? new Date(date) : date;
  const parts = new Intl.DateTimeFormat("en-u-ca-persian", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    timeZone: "Asia/Tehran",
  }).formatToParts(d);

  const read = (type: Intl.DateTimeFormatPartTypes): number =>
    Number(parts.find((part) => part.type === type)?.value ?? Number.NaN);

  return { year: read("year"), month: read("month"), day: read("day") };
};
