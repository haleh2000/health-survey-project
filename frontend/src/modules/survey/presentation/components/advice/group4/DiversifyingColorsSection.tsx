import { WeeklyDayTracker } from "../shared/WeeklyDayTracker";

const COLOR_LABELS = ["قرمز", "نارنجی", "زرد", "سبز", "بنفش/آبی", "سفید"];

export function DiversifyingColorsSection() {
  return (
    <div className="flex flex-col gap-4 my-4">
      {COLOR_LABELS.map((label, i) => (
        <WeeklyDayTracker key={label} label={label} showDayHeaders={i === 0} />
      ))}
    </div>
  );
}
