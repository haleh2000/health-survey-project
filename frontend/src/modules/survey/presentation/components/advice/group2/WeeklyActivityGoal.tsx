// WeeklyActivityTracker.tsx
const DAYS = ["شنبه","یک‌شنبه","دوشنبه","سه‌شنبه","چهارشنبه","پنج‌شنبه","جمعه"];

const WeeklyActivityTracker: React.FC = () => (
  <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
    <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4">
      هدف هفته: ۱۵۰ دقیقه هوازی + ۲ جلسه تمرین مقاومتی
    </h3>

    {/* فعالیت هوازی */}
    <div className="mb-6">
      <h4 className="text-sm sm:text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
        🏃‍♂️ فعالیت هوازی
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {DAYS.map((day) => (
          <div key={day} className="flex flex-col gap-3 text-xs text-gray-700">
            <span className="font-medium">{day}</span>
            <span>____ دقیقه</span>
          </div>
            ))}
          </div>

      <div className="mt-4 p-2.5 sm:p-3 bg-day-primary/5 rounded-lg text-xs sm:text-sm font-medium text-gray-800">
        جمع کل هوازی هفته: ____ دقیقه / ۱۵۰ دقیقه
      </div>
    </div>

    {/* تمرین مقاومتی */}
    <div>
      <h4 className="text-sm sm:text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
        🏋️ تمرین مقاومتی
      </h4>
      <div className="space-y-2 text-xs sm:text-sm text-gray-700">
        <div>جلسه اول - نوع تمرین: __________________________</div>
        <div>جلسه دوم - نوع تمرین: __________________________</div>
      </div>
      <div className="mt-4 p-2.5 sm:p-3 bg-day-red/5 rounded-lg text-xs sm:text-sm font-medium text-gray-800">
        تعداد جلسات مقاومتی انجام‌شده: ____ / ۲
      </div>
    </div>
  </div>
);

export default WeeklyActivityTracker;
