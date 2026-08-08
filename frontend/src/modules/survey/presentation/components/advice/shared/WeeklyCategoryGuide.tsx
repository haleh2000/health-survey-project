// // src/modules/survey/presentation/components/advice/shared/WeeklyCategoryGuide.tsx
// import { WeeklyDayTracker } from "./WeeklyDayTracker";

// export interface CategoryGroup {
//   emoji: string;
//   label: string;
//   items: string;
// }

// interface WeeklyCategoryGuideProps {
//   description: string;
//   groups: CategoryGroup[];
// }

// export function WeeklyCategoryGuide({
//   description,
//   groups,
// }: WeeklyCategoryGuideProps) {
//   return (
//     <div className="flex flex-col gap-4 rounded-2xl bg-day-primary/5 p-4">
//       <p className="text-sm leading-relaxed text-ink-subtle">{description}</p>
//       <div className="flex flex-col gap-3 mb-4">
//         {groups.map((group) => (
//           <div
//             key={group.label}
//             className="flex items-start gap-2 rounded-xl bg-white p-3 shadow-sm"
//           >
//             <span className="text-lg leading-none">{group.emoji}</span>
//             <p className="text-sm leading-relaxed text-ink">
//               <span className="font-bold text-gray-400">{group.label}:</span>{" "}
//               <span className="text-ink-subtle">{group.items}</span>
//             </p>
//           </div>
//         ))}
//       </div>
//       <div className="flex flex-col gap-4">
//         {groups.map((group, i) => (
//           <WeeklyDayTracker
//             key={group.label}
//             label={`${group.emoji} ${group.label}`}
//             showDayHeaders={i === 0}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }

// src/modules/survey/presentation/components/advice/shared/WeeklyCategoryGuide.tsx
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
      <p className="text-sm leading-relaxed text-ink-subtle">{description}</p>
      <div className="flex flex-col gap-3 mb-4">
        {/* {groups.map((group) => (
          <div key={group.label} className="flex items-start gap-2 rounded-xl bg-white p-3 shadow-sm">
            <p className="text-sm leading-relaxed text-ink">
              <span className="font-bold text-gray-400">{group.label}:</span>{" "}
              <span className="text-ink-subtle">{group.items}</span>
            </p>
          </div>
        ))} */}
      </div>
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

 