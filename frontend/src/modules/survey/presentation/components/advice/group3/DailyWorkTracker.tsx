// src/modules/survey/presentation/components/shared/DailyWorkTracker.tsx
import { useState } from "react";
import { toPersianDigits } from "@core/utils/numbers";

const DAYS = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه"] as const;
const SESSIONS_PER_DAY = 5;

type SessionState = { work: boolean; rest: boolean };
type DayState = { sessions: SessionState[] };

export function DailyWorkTracker() {
  const [days, setDays] = useState<DayState[]>(
    DAYS.map(() => ({
      sessions: new Array(SESSIONS_PER_DAY).fill(null).map(() => ({ work: false, rest: false })),
    }))
  );

  const toggleWork = (dayIdx: number, sessionIdx: number) => {
    setDays((prev) =>
      prev.map((d, i) => {
        if (i !== dayIdx) return d;
        return {
          sessions: d.sessions.map((s, j) =>
            j === sessionIdx ? { ...s, work: !s.work } : s
          ),
        };
      })
    );
  };

  const toggleRest = (dayIdx: number, sessionIdx: number) => {
    setDays((prev) =>
      prev.map((d, i) => {
        if (i !== dayIdx) return d;
        return {
          sessions: d.sessions.map((s, j) =>
            j === sessionIdx ? { ...s, rest: !s.rest } : s
          ),
        };
      })
    );
  };

  const getCompletedPomodoros = (day: DayState) =>
    day.sessions.filter((s) => s.work && s.rest).length;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="rounded-xl bg-gradient-to-l from-purple-50 to-blue-50 px-3 sm:px-4 py-3 my-6 sm:my-10 border border-purple-100">
        <span className="text-xs sm:text-sm font-bold text-purple-700 block">
          پلنر هفتگی کار عمیق | روزانه {toPersianDigits(SESSIONS_PER_DAY)} پومودورو (۲۵ دقیقه کار + ۵ دقیقه استراحت)
        </span>
      </div>

      <div className="space-y-6 sm:space-y-10">
        {days.map((day, dayIdx) => {
          const completedCount = getCompletedPomodoros(day);
          const displayCount = completedCount === 0 ? "______" : toPersianDigits(completedCount);

          return (
            <div key={DAYS[dayIdx]} className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 px-1 sm:px-2">
                <span className="text-sm font-bold text-gray-700">{DAYS[dayIdx]}</span>
                <span className="text-xs text-gray-600">
                  ✅ امروز: {displayCount} پومودورو کامل شد
                </span>
              </div>

              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2">
                {day.sessions.map((session, sessionIdx) => (
                  <div
                    key={sessionIdx}
                    className="flex flex-col gap-1.5 rounded-lg border border-gray-200 bg-white px-2 py-2 shadow-sm"
                  >
                    <span className="text-[11px] font-bold text-gray-500 text-center">
                      بازه {toPersianDigits(sessionIdx + 1)}
                    </span>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={session.work}
                        onChange={() => toggleWork(dayIdx, sessionIdx)}
                        className="h-4 w-4 sm:h-3 sm:w-3 shrink-0 accent-blue-600 cursor-pointer"
                      />
                      <span className="text-[10px] text-gray-600 whitespace-nowrap">
                        {toPersianDigits(25)} دقیقه کار
                      </span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={session.rest}
                        onChange={() => toggleRest(dayIdx, sessionIdx)}
                        className="h-4 w-4 sm:h-3 sm:w-3 shrink-0 accent-green-600 cursor-pointer"
                      />
                      <span className="text-[10px] text-gray-600 whitespace-nowrap">
                        {toPersianDigits(5)} دقیقه استراحت
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

export default DailyWorkTracker;
