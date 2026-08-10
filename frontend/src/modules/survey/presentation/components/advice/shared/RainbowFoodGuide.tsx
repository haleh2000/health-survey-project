// // src/modules/survey/presentation/components/advice/group4/RainbowFoodGuide.tsx
// import {
//   WeeklyCategoryGuide,
//   type CategoryGroup,
// } from "../shared/WeeklyCategoryGuide";

// const COLOR_GROUPS: CategoryGroup[] = [
//   {
//     emoji: "🟥",
//     label: "قرمز",
//     items:
//       "توت‌فرنگی، گوجه‌فرنگی، فلفل دلمه‌ای قرمز، انار، سیب قرمز، هندوانه، آلبالو، تمشک، چغندر، تربچه قرمز",
//   },
//   {
//     emoji: "🟨",
//     label: "نارنجی/زرد",
//     items:
//       "هویج، کدو، ذرت، پرتقال، نارنگی، زردآلو، انبه، آناناس، فلفل دلمه‌ای زرد، لیمو، هلو، کدوحلوایی",
//   },
//   {
//     emoji: "🟩",
//     label: "سبز",
//     items:
//       "کیوی، کاهو، بروکلی، اسفناج، لوبیا سبز، خیار، کلم بروکلی، نخودفرنگی، کلم‌برگ، جعفری، آووکادو، کرفس",
//   },
//   {
//     emoji: "⬜",
//     label: "سفید/قهوه‌ای",
//     items:
//       "جو دوسر، گردو، قارچ، سیر، پیاز، گل‌کلم، سیب‌زمینی، نان سبوس‌دار، بادام، کنجد، برنج قهوه‌ای، لوبیای سفید",
//   },
//   {
//     emoji: "🟪",
//     label: "بنفش/آبی",
//     items:
//       "بادمجان، کلم قرمز، آلو بنفش، انگور بنفش، بلوبری، شاه‌توت، تمشک سیاه، انجیر، زیتون سیاه، پیاز قرمز تیره",
//   },
// ];

// export function RainbowFoodGuide() {
//   return (
//     <WeeklyCategoryGuide
//       description="روش ثبت: در هر روز، هر رنگی را که از منابع طبیعی و سالم دریافت کرده‌اید علامت بزنید؛ هدف این است که در طول هفته، از گروه‌های رنگی بیشتری استفاده شود."
//       groups={COLOR_GROUPS}
//     />
//   );
// }

// src/modules/survey/presentation/components/advice/group4/RainbowFoodGuide.tsx
import { WeeklyCategoryGuide, type CategoryGroup } from "../shared/WeeklyCategoryGuide";

const COLOR_GROUPS: CategoryGroup[] = [
  { emoji: "🟥", label: "قرمز", items: " توت فرنگی، گوجه‌فرنگی، فلفل دلمه‌ای قرمز، انار، سیب قرمز، هندوانه، آلبالو، تمشک، چغندر، تربچه قرمز" },
  { emoji: "🟨", label: "نارنجی/زرد", items: " هویج، کدو، ذرت، پرتقال، نارنگی، زردآلو، انبه، آناناس، فلفل دلمه‌ای زرد، لیمو، هلو، کدوحلوایی " },
  { emoji: "🟩", label: "سبز", items: " کیوی، کاهو، بروکلی، اسفناج، لوبیا سبز، خیار، کلم بروکلی، نخودفرنگی، کلم‌برگ، جعفری، آووکادو، کرفس " },
  { emoji: "⬜", label: "سفید/قهوه‌ای", items: " جو دوسر، گردو، قارچ، سیر، پیاز، گل‌کلم، سیب‌زمینی، نان سبوس‌دار، بادام، کنجد، برنج قهوه‌ای، لوبیای سفید " },
  { emoji: "🟪", label: "بنفش/آبی", items: " بادمجان، کلم قرمز، آلو بنفش، انگور بنفش، بلوبری، شاه‌توت، تمشک سیاه، انجیر، زیتون سیاه، پیاز قرمز تیره " },
];

const COLOR_LABELS: Record<string, string> = {
  "قرمز": "🟥 قرمز",
  "نارنجی/زرد": "🟨 نارنجی/زرد",
  "سبز": "🟩 سبز",
  "سفید/قهوه‌ای": "⬜ سفید/قهوه‌ای",
  "بنفش/آبی": "🟪 بنفش/آبی",
};

export function RainbowFoodGuide() {
  return (
    <WeeklyCategoryGuide
      description="روش ثبت: در هر روز، هر رنگی را که از منابع طبیعی و سالم دریافت کرده‌اید علامت بزنید؛ هدف این است که در طول هفته، از گروه‌های رنگی بیشتری استفاده شود."
      groups={COLOR_GROUPS}
      getTrackerLabel={(group) => COLOR_LABELS[group.label] ?? `${group.emoji} ${group.label}`}
    />
  );
}
