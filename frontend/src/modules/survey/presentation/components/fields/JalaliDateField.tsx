import { useMemo } from "react";

import {
  JALALI_MONTH_NAMES,
  formatJalaliIso,
  jalaliMonthLength,
  parseJalaliIso,
  todayJalali,
} from "@core/date/jalali";
import { toPersianDigits } from "@core/text/digits";
import { Select, type SelectOption } from "@ds/components/Select";

import type { JalaliDateQuestion } from "@survey/domain/entities/question.entity";

/** 0 stands for "not chosen yet" — `Number("")` and `Number(undefined)` differ. */
const asPart = (raw: string | undefined): number => {
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0;
};

export interface JalaliDateFieldProps {
  question: JalaliDateQuestion;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  describedBy?: string;
  id: string;
}

/**
 * A Jalali date picker built from three selects.
 *
 * The native `<input type="date">` is Gregorian, and the backend reads the
 * first four characters of this field as a **Jalali** year — so a browser date
 * picker would silently make everyone about 621 years old. Selects also avoid
 * pulling in a calendar dependency for what is only ever a birth date.
 *
 * The value is emitted as `YYYY-MM-DD` with ASCII digits, and only once all
 * three parts are chosen, so a partial selection reads as "unanswered".
 */
export function JalaliDateField({
  question,
  value,
  onChange,
  invalid,
  describedBy,
  id,
}: JalaliDateFieldProps) {
  const currentYear = useMemo(() => todayJalali().year, []);
  const parsed = parseJalaliIso(value);

  // Fall back to the raw parts so a half-built date survives re-renders.
  // `parseJalaliIso` returns null until all three are present and valid.
  const [rawYear, rawMonth, rawDay] = value.split("-");
  const year = parsed?.year ?? asPart(rawYear);
  const month = parsed?.month ?? asPart(rawMonth);
  const day = parsed?.day ?? asPart(rawDay);

  const years = useMemo<SelectOption[]>(() => {
    const oldest = currentYear - question.maxAge;
    const newest = currentYear - question.minAge;
    return Array.from({ length: newest - oldest + 1 }, (_, offset) => {
      const candidate = newest - offset;
      return { value: String(candidate), label: toPersianDigits(candidate) };
    });
  }, [currentYear, question.maxAge, question.minAge]);

  const months = useMemo<SelectOption[]>(
    () =>
      JALALI_MONTH_NAMES.map((name, index) => ({
        value: String(index + 1),
        label: name,
      })),
    [],
  );

  const days = useMemo<SelectOption[]>(() => {
    // Esfand is 29 or 30 days depending on the year, so the day list has to
    // wait for a year and month before it can be correct.
    const length = year && month ? jalaliMonthLength(year, month) : 31;
    return Array.from({ length }, (_, index) => ({
      value: String(index + 1),
      label: toPersianDigits(index + 1),
    }));
  }, [year, month]);

  const emit = (next: { year?: number; month?: number; day?: number }) => {
    const nextYear = next.year ?? year;
    const nextMonth = next.month ?? month;
    let nextDay = next.day ?? day;

    // Moving from Farvardin 31 to Mehr would otherwise leave an invalid day.
    if (nextYear && nextMonth && nextDay) {
      nextDay = Math.min(nextDay, jalaliMonthLength(nextYear, nextMonth));
    }

  if (!nextYear || !nextMonth || !nextDay) {
  onChange(
    `${nextYear || ""}-${nextMonth || ""}-${nextDay || ""}`
  );
  return;
}

    onChange(formatJalaliIso({ year: nextYear, month: nextMonth, day: nextDay }));
  };

  return (
    <div className="grid grid-cols-3 gap-2.5" aria-describedby={describedBy}>
      <Select
        id={id}
        options={days}
        placeholder="روز"
        value={day ? String(day) : ""}
        invalid={invalid ?? false}
        aria-label="روز تولد"
        onChange={(event) => emit({ day: Number(event.target.value) })}
      />
      <Select
        options={months}
        placeholder="ماه"
        value={month ? String(month) : ""}
        invalid={invalid ?? false}
        aria-label="ماه تولد"
        onChange={(event) => emit({ month: Number(event.target.value) })}
      />
      <Select
        options={years}
        placeholder="سال"
        value={year ? String(year) : ""}
        invalid={invalid ?? false}
        aria-label="سال تولد"
        onChange={(event) => emit({ year: Number(event.target.value) })}
      />
    </div>
  );
}