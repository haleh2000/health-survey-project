// WeeklyHabitTracker.tsx
interface HabitStatus {
  day: string;
  options: string[];
}

const HABIT_STATUS_DATA: HabitStatus[] = [
  { day: 'شنبه', options: ['طبق برنامه', 'لغزش', 'بازگشت'] },
  { day: 'یکشنبه', options: ['طبق برنامه', 'لغزش', 'بازگشت'] },
  { day: 'دوشنبه', options: ['طبق برنامه', 'لغزش', 'بازگشت'] },
  { day: 'سه‌شنبه', options: ['طبق برنامه', 'لغزش', 'بازگشت'] },
  { day: 'چهارشنبه', options: ['طبق برنامه', 'لغزش', 'بازگشت'] },
  { day: 'پنجشنبه', options: ['طبق برنامه', 'لغزش', 'بازگشت'] },
  { day: 'جمعه', options: ['طبق برنامه', 'لغزش', 'بازگشت'] },
];

export const WeeklyHabitTracker: React.FC = () => {
  return (
    <div className="my-8 w-full border border-day-primary rounded-lg overflow-hidden">
      {HABIT_STATUS_DATA.map((row, index) => (
        <div
          key={row.day}
          className={`grid grid-cols-4 gap-0 ${
            index !== HABIT_STATUS_DATA.length - 1 ? 'border-b border-day-primary' : ''
          }`}
        >
          <div className="py-1.5 sm:py-3 px-1 sm:px-4 font-semibold text-[9px] sm:text-sm text-gray-700 bg-day-primary/5 border-l border-day-primary text-center flex items-center justify-center">
            {row.day}
          </div>
          {row.options.map((option, optIndex) => (
            <div
              key={option}
              className={`py-1.5 sm:py-3 px-1 sm:px-4 text-center text-[9px] sm:text-sm text-gray-600 flex items-center justify-center gap-1 sm:gap-2 ${
                optIndex < row.options.length - 1 ? 'border-l border-day-primary' : ''
              } ${
                option === 'طبق برنامه'
                  ? 'text-teal-600'
                  : option === 'لغزش'
                  ? 'text-pink-600'
                  : 'text-gray-600'
              }`}
            >
              <span className="inline-block w-2.5 h-2.5 sm:w-4 sm:h-4 border-2 border-current rounded shrink-0"></span>
              <span className="leading-tight">{option}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
