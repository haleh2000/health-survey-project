// DailyWaterTracker.tsx
import React, { useState } from "react";
import bottleImg from "@survey/presentation/assets/advice/group2/Bottle.png";

const DAYS = ["شنبه", "یک‌شنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه"];

const DailyWaterTracker: React.FC = () => {
  const [weekData, setWeekData] = useState(
    DAYS.map((name) => ({ name, glasses: Array(8).fill(false) }))
  );

  const toggleGlass = (di: number, gi: number) => {
    setWeekData((prev) =>
      prev.map((day, i) =>
        i !== di ? day : { ...day, glasses: day.glasses.map((g, j) => (j === gi ? !g : g)) }
      )
    );
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 p-2 sm:p-4">
      {weekData.map((day, di) => (
        <div key={day.name} className="flex justify-center">
          <div className="relative w-2 sm:w-32 md:w-36 lg:w-30">
            <img src={bottleImg} alt="بطری آب" className="w-full h-auto" />
            <div className="absolute top-[3%] left-0 right-0 flex justify-center">
              <span className="text-[10px] sm:text-sm font-bold text-white">{day.name}</span>
            </div>
            <div className="absolute top-[35%] left-[15%] right-[15%] bottom-[8%] flex flex-col gap-0.5">
              {day.glasses.map((filled, gi) => (
                <button
                  key={gi}
                  onClick={() => toggleGlass(di, gi)}
                  className={`flex-1 rounded transition-colors ${
                    filled ? "bg-cyan-400/80" : "bg-transparent"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DailyWaterTracker;
