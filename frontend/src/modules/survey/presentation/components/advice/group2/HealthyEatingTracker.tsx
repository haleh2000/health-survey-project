
import { useState } from "react";

const DAYS = ["شنبه","یکشنبه","دوشنبه","سه‌شنبه","چهارشنبه","پنج‌شنبه","جمعه"];

const ITEMS = [
  { emoji: "🍔", title: "فست فود و غذاهای چرب", limit: " سقف مجاز در هفته: حداکثر ۱ وعده ", description: "(تعداد روزهایی که مصرف کرده‌اید را علامت بزنید.)", totalLabel: " تعداد کل مصرف در هفته ", unit: "وعده" },
  { emoji: "🥓", title: "فرآورده‌های گوشتی(سوسیس، کالباس و…) ", limit: "حداکثر ۱ وعده در هفته", description: "(تعداد روزهایی که مصرف کرده‌اید را علامت بزنید.)", totalLabel: "تعداد کل مصرف در هفته", unit: "وعده" },
  { emoji: "🥔", title: "تنقلات و اسنک‌های شور (چیپس و ...)", limit: "حداکثر ۱ وعده در هفته", description: "(تعداد روزهایی که مصرف کرده‌اید را علامت بزنید.)", totalLabel: "تعداد کل مصرف در هفته", unit: "وعده" },
  { emoji: "🧂", title: "افزودن نمک اضافه به غذا", limit: "هدف: کاهش مصرف", description: "تعداد روزهایی که نمک اضافه نکردید را علامت بزنید.", totalLabel:" تعداد روزهای موفق(بدون نمک اضافه)", unit: "روز" },
];

export default function WeeklyFoodTracker() {
  const [data, setData] = useState(ITEMS.map(() => Array(7).fill(false)));

  const toggle = (itemIndex: number, dayIndex: number) =>
    setData(prev => prev.map((item, i) =>
      i === itemIndex ? item.map((v, j) => j === dayIndex ? !v : v) : item
    ));

  return (
    <div className="space-y-5">
      {ITEMS.map((item, itemIndex) => {
        const week = data[itemIndex] ?? [];
        return (
          <div key={item.title} className="text-gray-600 rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
            <h3 className="text-base sm:text-lg font-bold">{item.emoji} {item.title}</h3>
            <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600">{item.limit}</p>
            <p className="mb-5 sm:mb-8 text-xs sm:text-sm text-gray-500">{item.description}</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-y-2 gap-x-4 sm:gap-x-6">
              {DAYS.map((day, dayIndex) => (
                <label key={day} className="flex items-center gap-1.5 sm:gap-2 cursor-pointer">
                  <span className="w-16 sm:w-20 text-xs sm:text-sm text-gray-700 text-right">{day}</span>
                  <input
                    type="checkbox"
                    checked={week[dayIndex] ?? false}
                    onChange={() => toggle(itemIndex, dayIndex)}
                    className="h-4 w-4 sm:h-5 sm:w-5 rounded border-cyan-300 accent-cyan-400 cursor-pointer"
                  />
                </label>
              ))}
            </div>

            <div className="mt-4 rounded-lg bg-day-primary/5 px-3 sm:px-4 py-2.5 sm:py-3 text-center text-xs sm:text-sm font-bold text-day-primary">
              {item.totalLabel}: [ ________ ] {item.unit}
            </div>
          </div>
        );
      })}
    </div>
  );
}
