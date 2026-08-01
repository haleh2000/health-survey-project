// src/modules/survey/presentation/components/advice/WeeklyTracker.tsx
import { useState } from "react";
import { cn } from "@ds/lib/cn";

const WEEK_DAYS = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

interface WeeklyTrackerProps {
  label: string;
}

export function WeeklyTracker({ label }: WeeklyTrackerProps) {
  const [checked, setChecked] = useState<boolean[]>(Array(7).fill(false));

  const toggleDay = (index: number) => {
    setChecked((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  return (
    <div className="space-y-3 rounded-xl border-2 border-day-primary bg-cyan-50/30 p-4">
      <p className="text-sm font-semibold text-gray-500">{label}</p>

      <div className="flex justify-between gap-2">
        {WEEK_DAYS.map((day, index) => (
          <button
            key={index}
            onClick={() => toggleDay(index)}
            className={cn(
              "flex h-12 w-12 flex-col items-center justify-center rounded-full border-2 text-xs font-bold transition-all",
              checked[index]
                ? " border-head bg-cyan-500 text-white"
                : " border-day-primary bg-white text-ink-subtle hover:border-cyan-400",
            )}
          >
            <span>{day}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
