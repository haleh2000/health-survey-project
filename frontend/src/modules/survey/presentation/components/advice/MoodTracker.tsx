// src/modules/survey/presentation/components/advice/MoodTracker.tsx
import { useState } from "react";
import { cn } from "@ds/lib/cn";

const WEEK_DAYS = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

const MOOD_ICONS = [
  { emoji: "😄", label: "عالی" },
  { emoji: "🙂", label: "خوب" },
  { emoji: "😐", label: "معمولی" },
  { emoji: "😔", label: "ناراحت" },
  { emoji: "😢", label: "بد" },
];

export function MoodTracker() {
  const [moods, setMoods] = useState<(number | null)[]>(Array(7).fill(null));

  const setMood = (dayIndex: number, moodIndex: number) => {
    setMoods((prev) => {
      const next = [...prev];
      next[dayIndex] = next[dayIndex] === moodIndex ? null : moodIndex;
      return next;
    });
  };

  return (
    <div className="space-y-4 rounded-xl border-2 border-pink-200 bg-pink-50/30 p-4">
      <div>
        <h4 className="text-sm font-semibold text-ink">📊 ردیابی خلق‌وخو</h4>
        <p className="mt-1 text-xs text-ink-subtle">
          شیت را ثبت و سادگی و حضرت خود را کشف کرده و پیش از رسیدن به شرطط
          بحرانی، اقدامات پیشگیرانه انجام دهید.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between border-b border-pink-200 pb-2 text-xs font-semibold text-ink">
          <span className="w-12"></span>
          {WEEK_DAYS.map((day, i) => (
            <span key={i} className="w-10 text-center">
              {day}
            </span>
          ))}
        </div>

        {MOOD_ICONS.map((mood, moodIndex) => (
          <div key={moodIndex} className="flex items-center justify-between">
            <span className="w-12 text-2xl">{mood.emoji}</span>
            {WEEK_DAYS.map((_, dayIndex) => (
              <button
                key={dayIndex}
                onClick={() => setMood(dayIndex, moodIndex)}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg border-2 text-xl transition-all",
                  moods[dayIndex] === moodIndex
                    ? "border-pink-500 bg-pink-500 shadow-md"
                    : "border-gray-200 bg-white hover:border-pink-400",
                )}
              >
                {moods[dayIndex] === moodIndex ? mood.emoji : ""}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
