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
          <div className="py-3 px-4 font-semibold text-gray-700 bg-day-primary/5 border-l border-day-primary text-center">
            {row.day}
          </div>
          {row.options.map((option, optIndex) => (
            <div
              key={option}
              className={`py-3 px-4 text-center text-sm text-gray-600 flex items-center justify-center gap-2 ${
                optIndex < row.options.length - 1 ? 'border-l border-day-primary' : ''
              } ${
                option === 'طبق برنامه'
                  ? 'text-teal-600'
                  : option === 'لغزش'
                  ? 'text-pink-600'
                  : 'text-gray-600'
              }`}
            >
              <span className="inline-block w-4 h-4 border-2 border-current rounded"></span>
              <span>{option}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
