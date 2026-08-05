// NutritionHabitTracker.tsx
import { useState } from "react";

const DAYS = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه"];

const ISSUES = [
  { icon: "📍", cause: "کمبود زمان", solution: "از سیستم Batch Cooking (پخت عمده پروتئین/حبوبات در تعطیلات) استفاده کنید." },
  { icon: "📍", cause: "خستگی/بی‌انگیزگی", solution: 'دستورپخت‌های "زیر ۱۵ دقیقه" را برای روزهای پرمشغله لیست کنید.' },
  { icon: "📍", cause: "دسترسی به غذای ناسالم", solution: "محیط خانه را پاکسازی کنید؛ همیشه میان‌وعده سالم (آجیل/میوه) در دسترس داشته باشید." },
  { icon: "📍", cause: "خرید نکردن مواد اولیه", solution: "لیست خرید هفتگی را آخر هفته‌ها بر اساس برنامه غذایی نهایی کنید." },
];

export function NutritionHabitTracker() {
  const [checked, setChecked] = useState<boolean[]>(Array(7).fill(false));
  const [successCount, setSuccessCount] = useState("");

  const toggle = (i: number) => setChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)));

  return (
    <div className="bg-white rounded-2xl p-5 shadow space-y-5 text-right" dir="rtl">
      {/* Header */}
      <div className="flex items-start flex-col gap-2">
        <span className="text-lg text-lg text-day-primary">🌿هدف</span>
        <p className="text-sm font-semibold text-day-primary">
           حداقل ۶ روز تغذیه سالم در هفته (با نظارت بر کیفیت مواد اولیه)
        </p>
      </div>

        <div className="flex flex-wrap gap-2 justify-start items-center my-8">
        {DAYS.map((day, i) => (
            <button
            key={day}
            onClick={() => toggle(i)}
            className={`flex flex-col items-center gap-1 w-14 py-2 rounded-xl border text-xs font-medium transition-colors ${
                checked[i]
                ? "bg-green-100 border-green-400 text-green-700"
                : "bg-gray-50 border-gray-200 text-gray-600"
            }`}
            >
            <span>{day}</span>
            <span>{checked[i] ? "✅" : "☐"}</span>
            </button>
        ))}
        </div>


      {/* Success count */}
      <div className="flex items-center gap-2 justify-start">
        <span className="text-sm font-medium text-gray-700">تعداد روزهای موفق:</span>
         <span className="text-day-primary">[ _________ ]</span>
        <span className="text-sm text-gray-600">از ۷</span>
        
      </div>

      {/* Root cause section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-base">🔍</span>
          <h3 className="text-sm font-bold text-gray-800">ریشه‌یابی و بهبود (فقط برای روزهای ناموفق)</h3>
        </div>
        <p className="text-sm text-gray-500">
          اگر موفق به پخت غذای خانگی نشدید، علت را پیدا کنید تا راهکار متناسب را پیدا کنید.
        </p>
        <div className="space-y-2">
          {ISSUES.map(({ icon, cause, solution }) => (
            <div key={cause} className="bg-gray-50 rounded-xl p-3 text-xs text-gray-700 space-y-1">
              <div className="flex items-center gap-1 font-semibold">
                <span>{icon}</span>
                <span>{cause}</span>
                <span className="text-gray-400 mx-1">◀️</span>
              </div>
              <p className="text-gray-600 pr-4">{solution}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
