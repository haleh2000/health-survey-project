// DatePicker.tsx
import { cn } from "@ds/lib/cn";

interface DatePickerProps {
  value?: { day: string; month: string; year: string };
  onChange?: (value: { day: string; month: string; year: string }) => void;
  invalid?: boolean;
  className?: string;
}

const months = [
  { value: "1", label: "فروردین" }, { value: "2", label: "اردیبهشت" },
  { value: "3", label: "خرداد" },   { value: "4", label: "تیر" },
  { value: "5", label: "مرداد" },   { value: "6", label: "شهریور" },
  { value: "7", label: "مهر" },     { value: "8", label: "آبان" },
  { value: "9", label: "آذر" },     { value: "10", label: "دی" },
  { value: "11", label: "بهمن" },   { value: "12", label: "اسفند" },
];

const inputClass = (invalid: boolean) =>
  cn(
    "h-12 rounded-control border bg-white px-3 text-sm text-gray-500 text-center",
    "focus:border-day-second focus:outline-none focus:ring-1 focus:ring-day-second",
    invalid ? "border-danger" : "border-line-strong",
  );

export function DatePicker({ value, onChange, invalid = false, className }: DatePickerProps) {
  const update = (field: "day" | "month" | "year", val: string) =>
    onChange?.({ ...(value ?? { day: "", month: "", year: "" }), [field]: val });

  return (
    <div className={cn("flex gap-2", className)}>
      <input
        type="number"
        min={1} max={31}
        placeholder="روز"
        value={value?.day ?? ""}
        onChange={(e) => update("day", e.target.value)}
        className={cn(inputClass(invalid), "w-16")}
      />
      <select
        value={value?.month ?? ""}
        onChange={(e) => update("month", e.target.value)}
        className={cn(inputClass(invalid), "flex-1")}
      >
        <option value="">ماه</option>
        {months.map((m) => (
          <option key={m.value} value={m.value}>{m.label}</option>
        ))}
      </select>
      <input
        type="number"
        min={1300} max={1420}
        placeholder="سال"
        value={value?.year ?? ""}
        onChange={(e) => update("year", e.target.value)}
        className={cn(inputClass(invalid), "w-20")}
      />
    </div>
  );
}
