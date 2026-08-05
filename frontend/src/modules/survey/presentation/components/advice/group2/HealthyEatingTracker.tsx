import { useState } from "react";

const DAYS = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنج‌شنبه",
  "جمعه",
];

const ITEMS = [
  {
    emoji: "🍔",
    title: "فست فود و غذاهای چرب",
    limit: "حداکثر ۱ وعده در هفته",
    description: "روزهایی که مصرف کرده‌اید را علامت بزنید.",
    totalLabel: " تعداد کل مصرف در هفته ",
  },
  {
    emoji: "🥓",
    title: "فرآورده‌های گوشتی",
    limit: "حداکثر ۱ وعده در هفته",
    description: "روزهایی که مصرف کرده‌اید را علامت بزنید.",
    totalLabel: "تعداد کل مصرف در هفته",
  },
  {
    emoji: "🥔",
    title: "تنقلات و اسنک‌های شور",
    limit: "حداکثر ۱ وعده در هفته",
    description: "روزهایی که مصرف کرده‌اید را علامت بزنید.",
    totalLabel: "تعداد کل مصرف در هفته",
  },
  {
    emoji: "🧂",
    title: "اضافه نکردن نمک به غذا",
    limit: "هدف: کاهش مصرف",
    description: "روزهایی که نمک اضافه نکردید را علامت بزنید.",
    totalLabel:" تعداد روزهای موفق(بدون نمک اضافه)",
  },
];

export default function WeeklyFoodTracker() {
  const [data, setData] = useState(
    ITEMS.map(() => Array(7).fill(false))
  );

  const toggle = (itemIndex: number, dayIndex: number) => {
    setData((prev) =>
      prev.map((item, i) =>
        i === itemIndex
          ? item.map((value, j) => (j === dayIndex ? !value : value))
          : item
      )
    );
  };

  return (
    <div className="space-y-5">
      {ITEMS.map((item, itemIndex) => {
        const week = data[itemIndex] ?? [];
        const total = week.filter(Boolean).length;

        return (
          <div
            key={item.title}
            className="text-gray-500 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <h3 className="text-lg font-bold">
              {item.emoji} {item.title}
            </h3>

            <p className="mt-4 text-sm text-gray-600">
              {item.limit}
            </p>

            <p className="mb-8 text-sm text-gray-500">
              {item.description}
            </p>

        <div className="grid grid-cols-3 gap-y-3 gap-x-6">
            {DAYS.map((day, dayIndex) => (
                <label
                key={day}
                className="flex items-center gap-2 cursor-pointer"
                >
                <span className="w-20 text-sm text-gray-700 text-right">
                    {day}
                </span>

                <input
                    type="checkbox"
                    checked={week[dayIndex] ?? false}
                    onChange={() => toggle(itemIndex, dayIndex)}
                    className="
                    h-5 w-5
                    rounded
                    border-cyan-300
                    accent-cyan-400
                    cursor-pointer
                    "
                />
                </label>
            ))}
            </div>
            <div className="mt-4 rounded-lg bg-day-primary/5 px-4 py-3 text-center font-bold text-day-primary">
            {item.totalLabel}: [ ________ ] {item.title === "اضافه نکردن نمک به غذا" ? "روز" : "وعده"}
          </div>
          </div>
        );
      })}
    </div>
  );
}