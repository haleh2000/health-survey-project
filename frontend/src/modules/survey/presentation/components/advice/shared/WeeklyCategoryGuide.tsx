import { WeeklyDayTracker } from "./WeeklyDayTracker";

export interface CategoryGroup {
  label: string;
  items?: string;
  emoji?: string;
}

interface WeeklyCategoryGuideProps {
  description?: string;
  groups: CategoryGroup[];
  getTrackerLabel?: (group: CategoryGroup, index: number) => string;
}

export function WeeklyCategoryGuide({ description, groups, getTrackerLabel }: WeeklyCategoryGuideProps) {
  return (
    <div className="my-4 flex flex-col rounded-2xl bg-day-primary/5 p-4">
      <p className="text-sm leading-relaxed text-ink-subtle mb-4">{description}</p>
    
      <div className="flex flex-col gap-4">
        {groups.map((group, i) => (
          <WeeklyDayTracker
            key={group.label}
            label={getTrackerLabel ? getTrackerLabel(group, i) : group.label}
            showDayHeaders={i === 0}
          />
        ))}
      </div>
    </div>
  );
}

 