// MoodTracker.tsx
import { useState } from "react";
import { cn } from "@ds/lib/cn";
import moodGreat from "@survey/presentation/assets/advice/group1/mood/great.png";
import moodGood from "@survey/presentation/assets/advice/group1/mood/good.png";
import moodNeutral from "@survey/presentation/assets/advice/group1/mood/neutral.png";
import moodSad from "@survey/presentation/assets/advice/group1/mood/sad.png";
import moodBad from "@survey/presentation/assets/advice/group1/mood/bad.png";



const WEEK_DAYS = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

const MOOD_ICONS = [
  { image: moodGreat, label: "عالی" },
  { image: moodGood, label: "خوب" },
  { image: moodNeutral, label: "معمولی" },
  { image: moodSad, label: "ناراحت" },
  { image: moodBad, label: "بد" },
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
    <div className="space-y-3 sm:space-y-4 rounded-xl border-2 border-pink-200 bg-pink-50/30 p-3 sm:p-4">
      <div>
        <ul className="space-y-1 text-xs sm:text-sm text-gray-700">
          <li className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl">📊</span>
            <span className="text-day-red text-base sm:text-lg font-bold">ردیابی خلق‌ و خو</span>
          </li>
          <li className="flex items-start gap-2">
            <span>ثبت روزانه و ساده‌ی وضعیت روحی که به شما کمک می‌کند الگوهای پنهان نوسانات خلقی خود را کشف کرده و پیش از رسیدن به شرایط بحرانی، اقدامات پیشگیرانه انجام دهید.</span>
          </li>
        </ul>
      </div>

      <div className="flex gap-3 sm:gap-8">
        <div className="flex items-center">
          <span className="text-xs sm:text-base font-semibold text-gray-400 [writing-mode:vertical-rl] rotate-360">
            ردیابی خلق ‌و خو
          </span>
        </div>

        <div className="flex-1 min-w-0 space-y-2 sm:space-y-3">
          <div className="flex justify-between border-b pb-1 sm:pb-2 text-xs sm:text-sm font-semibold text-day-primary">
            {WEEK_DAYS.map((day, i) => (
              <span key={i} className="w-7 sm:w-10 text-center">
                {day}
              </span>
            ))}
          </div>

          {MOOD_ICONS.map((mood, moodIndex) => (
            <div key={moodIndex} className="flex items-center justify-between">
              {WEEK_DAYS.map((_, dayIndex) => (
                <button
                  key={dayIndex}
                  onClick={() => setMood(dayIndex, moodIndex)}
                  className={cn(
                    "flex h-7 w-7 sm:h-10 sm:w-10 items-center justify-center text-lg sm:text-xl",
                  )}
                >
                  <img src={mood.image} alt={mood.label} className="h-8 w-8 sm:h-12 sm:w-12 object-contain" />

                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
