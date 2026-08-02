// src/modules/survey/presentation/components/advice/shared/WeeklyGoalsHeader.tsx
import { cn } from "@ds/lib/cn";

interface WeeklyGoalsHeaderProps {
  title?: string;
  bgColorClass?: string;
  textColorClass?: string;
}

export function WeeklyGoalsHeader({
  title = "راهکارهای طلایی هفتگی برای رسیدن به تعادل",
  bgColorClass = "bg-day-red/20",
  textColorClass = "text-day-red",
}: WeeklyGoalsHeaderProps) {
  return (
    <div className="flex justify-center">
      <div className={cn("inline-block mt-4 px-4", bgColorClass)}>
        <h2
          className={cn(
            "relative -top-3 text-lg font-bold whitespace-nowrap",
            textColorClass,
          )}
        >
          {title}
        </h2>
      </div>
    </div>
  );
}
