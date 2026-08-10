// src/modules/survey/presentation/components/advice/shared/WeeklyDayTracker.tsx
const DAYS = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

interface WeeklyDayTrackerProps {
  label: string;
  showDayHeaders?: boolean;
}

export function WeeklyDayTracker({ label, showDayHeaders = false }: WeeklyDayTrackerProps) {
  return (
    <div className="relative pr-24 sm:pr-32">
      <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
      <span className="text-xs sm:text-sm font-bold text-gray-600 leading-tight break-words max-w-[4rem] sm:max-w-none text-right block">
        {label}
      </span>
    </div>

      {showDayHeaders && (
        <div className="grid grid-cols-7 gap-1 sm:gap-2 py-[10px]">
          {DAYS.map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-day-primary">{day}</span>
            </div>
          ))}
        </div>
      )}

      <div className="border-y border-day-primary py-2">
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {DAYS.map((_, i) => (
            <div key={i} className="flex justify-center">
              <div className="flex h-6 w-7 sm:h-10 sm:w-10 items-center justify-center rounded-full border-4 border-day-primary bg-white" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
