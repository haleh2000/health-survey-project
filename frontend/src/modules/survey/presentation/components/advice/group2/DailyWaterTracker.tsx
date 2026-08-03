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
  <div className="grid grid-cols-3 gap-4 p-4">
    {weekData.map((day, di) => (
      <div key={day.name} className="flex justify-center">
        {/* عکس بطری */}
        <div className="relative w-40">
          <img src={bottleImg} alt="بطری آب" className="w-full h-auto" />

          {/* نام روز */}
          <div className="absolute top-[3%] left-0 right-0 flex justify-center">
            <span className="text-sm font-bold text-white">
              {day.name}
            </span>
          </div>

          {/* قسمت‌های قابل کلیک */}
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
