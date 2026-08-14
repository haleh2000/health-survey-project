// src/modules/survey/presentation/components/shared/ExercisePhasePlanner.tsx
import { useMemo, useState } from "react";
import { toPersianDigits } from "@core/utils/numbers";

type DayItem = {
  day: string;
  activity: string;
};

type Phase = {
  id: string;
  icon: string;
  title: string;
  goal: string;
  weeksLabel: string;
  totalDays: number;
  days: DayItem[];
  note?: string;
};

const phases: Phase[] = [
  {
    id: "phase1",
    icon: "🚦",
    title: "فاز ۱: سازگاری",
    weeksLabel: "هفته ۱ تا ۴",
    goal: "ایجاد عادت و آماده‌سازی مفاصل",
    totalDays: 7,
    days: [
      { day: "شنبه", activity: "تمرین قدرتی (۱۵ دقیقه)" },
      { day: "یکشنبه", activity: "پیاده‌روی سریع (۱۵ دقیقه)" },
      { day: "دوشنبه", activity: "استراحت فعال (کشش)" },
      { day: "سه‌شنبه", activity: "تمرین قدرتی (۱۵ دقیقه)" },
      { day: "چهارشنبه", activity: "پیاده‌روی سریع (۱۵ دقیقه)" },
      { day: "پنج‌شنبه", activity: "پیاده‌روی سریع (۱۵ دقیقه)" },
      { day: "جمعه", activity: "استراحت کامل" },
    ],
  },
  {
    id: "phase2",
    icon: "🚀",
    title: "فاز ۲: شتاب‌دهنده متابولیک",
    weeksLabel: "هفته ۵ تا ۸",
    goal: "افزایش ضربان قلب و تحریک عضله‌سازی",
    totalDays: 6,
    days: [
      { day: "شنبه", activity: "هوازی (۳۰ دقیقه)" },
      { day: "یکشنبه", activity: "هوازی (۳۰ دقیقه)" },
      { day: "دوشنبه", activity: "استراحت فعال (کشش)" },
      { day: "سه‌شنبه", activity: "هوازی (۳۰ دقیقه)" },
      { day: "چهارشنبه", activity: "هوازی (۳۰ دقیقه)" },
      { day: "پنج‌شنبه", activity: "هوازی (۳۰ دقیقه)" },
      { day: "جمعه", activity: "تمرین قدرتی (وزن بدن)" },
    ],
  },
  {
    id: "phase3",
    icon: "🔥",
    title: "فاز ۳: بهینه‌سازی و کات",
    weeksLabel: "هفته ۹ تا ۱۲",
    goal: "افزایش شدت برای چربی‌سوزی حداکثری",
    totalDays: 6,
    days: [
      { day: "شنبه", activity: "تمرین قدرتی (چرخشی)" },
      { day: "یکشنبه", activity: "هوازی اینتروال (HIIT)" },
      { day: "دوشنبه", activity: "تمرین قدرتی (چرخشی)" },
      { day: "سه‌شنبه", activity: "هوازی اینتروال (HIIT)" },
      { day: "چهارشنبه", activity: "تمرین قدرتی (چرخشی)" },
      { day: "پنج‌شنبه", activity: "هوازی اینتروال (HIIT)" },
      { day: "جمعه", activity: "استراحت کامل" },
    ],
    note:
      "* تمرین قدرتی (چرخشی) = چند حرکت قدرتی را پشت سر هم و به‌صورت چرخه‌ای انجام دهید، نه اینکه یک حرکت را کامل تمام کرده و بعد سراغ حرکت بعدی بروید.\n* هوازی اینتروال = چند نوبت فعالیت تند و آرام به‌صورت پشت‌سرهم.",
  },
];

export function ExercisePhasePlanner() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const toggle = (key: string) => {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getCompletedCount = useMemo(() => {
    return (phase: Phase) =>
      phase.days.filter((d) => checked[`${phase.id}-${d.day}`]).length;
  }, [checked]);

  return (
    <div className="space-y-6">
      {phases.map((phase) => {
        const completed = getCompletedCount(phase);
        return (
          <div
            key={phase.id}
            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm my-8"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{phase.icon}</span>
              <h3 className="sm:text-base text-sm leading-5 mb-3 font-bold text-gray-800">
                {phase.title}
              </h3>
              <span className="text-xs font-bold text-gray-400">({phase.weeksLabel})</span>
            </div>
            <p className="text-sm text-gray-500 mb-3">هدف: {phase.goal}</p>

            <div className="space-y-2">
              {phase.days.map((d) => {
                const key = `${phase.id}-${d.day}`;
                const isChecked = !!checked[key];
                return (
                  <label
                    key={key}
                    className={`flex items-center gap-3 rounded-xl border p-2.5 cursor-pointer transition-colors ${
                      isChecked
                        ? "bg-green-50 border-green-200"
                        : "bg-gray-50 border-gray-100 hover:bg-gray-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggle(key)}
                      className="h-4 w-4 accent-green-600 shrink-0"
                    />
                    <span className="text-sm font-semibold text-gray-700 w-20 shrink-0">
                      {d.day}:
                    </span>
                    <span
                      className={`text-sm ${
                        isChecked ? "text-green-700 line-through" : "text-gray-600"
                      }`}
                    >
                      {d.activity}
                    </span>
                  </label>
                );
              })}
            </div>

            {phase.note && (
              <p className="mt-3 whitespace-pre-line text-xs text-gray-400 leading-5">
                {phase.note}
              </p>
            )}

            <div className="mt-4 flex items-center justify-between rounded-xl bg-day-primary/5 px-3 py-2">
              <span className="text-sm font-bold text-day-primary">هدف هفته</span>
              <span className="text-sm font-bold text-day-primary">
                {completed === 0 ? "[ ______ ]" : toPersianDigits(completed)} از {toPersianDigits(phase.totalDays)} روز انجام شد
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ExercisePhasePlanner;
