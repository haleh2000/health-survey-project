import React from "react";

const WeeklyActivityTracker: React.FC = () => {
  const persianDays = [
    "شنبه",
    "یک‌شنبه",
    "دوشنبه",
    "سه‌شنبه",
    "چهارشنبه",
    "پنج‌شنبه",
    "جمعه",
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        هدف هفته: ۱۵۰ دقیقه هوازی + ۲ جلسه تمرین مقاومتی
      </h3>

      {/* فعالیت هوازی */}
      <div className="mb-6">
        <h4 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
          🏃‍♂️ فعالیت هوازی
        </h4>
        <div className="space-y-2">
          {persianDays.map((day) => (
            <div key={day} className="flex items-center gap-2 text-sm text-gray-700">
              <span className="w-20">{day}:</span>
              <span>____ دقیقه</span>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-day-primary/5 rounded-lg text-sm font-medium text-gray-800">
          جمع کل هوازی هفته: ____ دقیقه / ۱۵۰ دقیقه
        </div>
      </div>

      <div>
        <h4 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
          🏋️ تمرین مقاومتی
        </h4>
        <div className="space-y-2 text-sm text-gray-700">
          <div>جلسه اول - نوع تمرین: __________________________</div>
          <div>جلسه دوم - نوع تمرین: __________________________</div>
        </div>
        <div className="mt-4 p-3 bg-day-red/5 rounded-lg text-sm font-medium text-gray-800">
          تعداد جلسات مقاومتی انجام‌شده: ____ / ۲
        </div>
      </div>
    </div>
  );
};

export default WeeklyActivityTracker;
