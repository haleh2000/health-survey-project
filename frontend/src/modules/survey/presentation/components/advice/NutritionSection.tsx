// src/modules/survey/presentation/components/advice/NutritionSection.tsx
import { useState } from "react";
import { AdviceSectionCard } from "./AdviceSectionCard";
import { ScaleSelector } from "./ScaleSelector";
import { WeeklyTracker } from "./WeeklyTracker";
import { cn } from "@ds/lib/cn";
import nutritionImg from "@survey/presentation/assets/advice/group1/nutrition-character.png";

const MEAL_PLANS = [
  "صبح آماده (تخم‌مرغ، نان سبوس‌دار با پنیر، فیفل سیاه)",
  "میان‌وعده صبح (مغز‌ها، پنیر و طماطم)",
  "ناهار (ماهی آماده بادام زمینی، سالاد، کربوهیدرات کم)",
  "میان‌وعده عصر (ماست بدون شکر یا میوه)",
  "شام (سوپ یا مرغ، فرنی با سبزیجات، اسلوجی پودود)",
  "نوشیدنی‌ها (آب (۸ لیوان)، چای سبز، آب‌میوه طبیعی)",
  "نکات‌های دوری (غذای جدید، نوری، مواج جوجی)",
];
const DAYS = ["ش","ی","د","س","چ","پ","ج"];

export function NutritionSection() {
  const [selectedMeals, setSelectedMeals] = useState<number[]>([]);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});

  return (
    <AdviceSectionCard
      borderTitle="پیشنهادات تغذیه"
      title="پیشنهادات تغذیه"
      imageSrc={nutritionImg}
      imageAlt="شخصیت تغذیه"
    >
      <div className="space-y-6">
        <div className="flex">
            <ul className="space-y-1 text-sm text-gray-700">
              <li className="flex items-center gap-2"><span className="text-2xl">🍽️</span><span className="text-day-red text-lg font-bold">بشقاب مدیترانه ای</span></li>
              <li className="flex items-center gap-2"><span>بشقاب مدیترانه‌ای یک الگوی غذایی سنتی، سالم و متوازن متعلق به کشورهای حاشیه دریای مدیترانه است که به جای حذف گروه‌های غذایی یا شمارش کالری، بر کیفیت غذا و مصرف چربی‌های سالم تمرکز دارد.</span></li>
              </ul>
        </div>
        <div className="flex items-start gap-3 rounded-lg bg-green-50 p-4">
          {/* <div className="flex-shrink-0 text-2xl">🥗</div> */}
          <div className="flex-1">
            <h4 className="mb-2 font-bold text-green-700">بشقاب ایده‌آل یک وعده من:</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li className="flex items-center gap-2"><span className="text-lg text-green-600">🥗</span><span>نیمی سبزیجات: مثلا سالاد، خیار، گوجه، سبزی خوردن، کاهو</span></li>
              <li className="flex items-center gap-2"><span className="text-lg text-blue-600">🐟</span><span>یک‌چهارم پروتئین: گوشت قرمز، مرغ یا ماهی</span></li>
              <li className="flex items-center gap-2"><span></span><span>یا ۶ عدد گردو (جایگزین ماهی برای امگا۳)</span></li>
              <li className="flex items-center gap-2"><span className="text-lg text-amber-600">🌾</span><span>یک‌چهارم غلات کامل: برنج قهوه‌ای / نان سبوس‌دار</span></li>
              <li className="flex items-center gap-2"><span className="text-lg text-green-600">🫒</span><span>روغن زیتون: فشنگی غذاخوری به جای کره/دنبه</span></li>
            </ul>
          </div>
        </div>

        <div>
          

<div className="relative" dir="rtl">
  {/* عنوان سمت راست */}
  <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white pr-2">
    <span className="text-sm font-bold text-gray-600 whitespace-nowrap">
      بشقاب ایده‌آل
    </span>
  </div>

  {/* ردیف روزها و دایره‌ها */}
  <div className="border-y border-day-primary py-3 pr-32">
    <div className="grid grid-cols-7 gap-2">
      {["ش", "ی", "د", "س", "چ", "پ", "ج"].map((day, i) => (
        <div
          key={i}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-day-primary text-xs font-bold ">
            {day}
          </span>

          <div
            className="
              flex h-10 w-10 items-center justify-center
              rounded-full
              border-4 border-day-primary
              bg-white
            "
          />
            </div>
          ))}
        </div>
      </div>
    </div>

          <div className="mt-6">
         <img src={nutritionImg} alt="شخصیت تغذیه" className="object-contain" />

          </div>

        </div>

        {/* توضیح چگونگی حذف */}
        <div className="space-y-3 rounded-xl bg-rose-50 p-4">
          <h3 className="text-md font-bold text-day-red">❌ چک لیست حذف:</h3>
          <h4 className="text-sm font-bold text-day-red">🧂نمک‌سنج روزانه</h4>
          <p className="text-sm leading-5 text-gray-400">
           نمکی که بهتر است روزانه مصرف کنید معمولاً کمتر از ۵ گرم نمک در روز توصیه می‌شود؛ حدود یک قاشق چای‌خوری.
          </p>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-400">منابع پنهان نمک</p>
            <ul className="mr-4 space-y-1 text-sm text-gray-500">
              <li>• نان سنگک (۱g)🔄 نان بدون نمک</li>
              <li>• پنیر لیقوان (۲g) 🔄 پنیر کم‌نمک</li>
              <li>• ترشی/شور (۳g)  🔄 سالاد یا سبزی خوردن </li>
              <li>• سس آماده (۲g)🔄 سس دست‌ساز یا رب‌گوجه تازه بدون نمک</li>
            </ul>
          </div>
        </div>

<div className="bg-white rounded-2xl p-4 border border-gray-200">
  <h4 className="text-sm font-bold text-gray-700 mb-3 text-right">
    جایگزین‌های طعم‌دهنده به‌جای نمک
  </h4>

  <div className="flex justify-center gap-2 mb-2">
    {[
      { icon: '🍋', label: 'آبلیمو تازه' },
      { icon: '🧴', label: 'سرکه' },
      { icon: '🫚', label: 'زنجبیل' },
    ].map((item, idx) => (
      <div
        key={idx}
        className="flex items-center gap-1.5 bg-gray-50 rounded-full px-3 py-1.5 border border-gray-200"
      >
        <span className="text-lg">{item.icon}</span>
        <span className="text-xs text-gray-600 whitespace-nowrap">{item.label}</span>
      </div>
    ))}
  </div>

  <div className="flex justify-center gap-2">
    {[
      { icon: '🧄', label: 'سیر و پیاز' },
      { icon: '⚫', label: 'فلفل سیاه' },
    ].map((item, idx) => (
      <div
        key={idx}
        className="flex items-center gap-1.5 bg-gray-50 rounded-full px-3 py-1.5 border border-gray-200"
      >
        <span className="text-lg">{item.icon}</span>
        <span className="text-xs text-gray-600 whitespace-nowrap">{item.label}</span>
      </div>
    ))}
  </div>
</div>

   <div className="space-y-2">
  <p className="text-sm font-semibold text-day-red flex items-center gap-1.5">
    ⚠️ مصرف موارد زیر را به حداقل برسانید
  </p>
  <div className="grid grid-cols-1 gap-1.5">
    {[
      { icon: "🚬", label: "سیگار" },
      { icon: "🍺", label: "الکل" },
      { icon: "🍔", label: "فست فود (برگر، پیتزا و ...)" },
      { icon: "🌭", label: "گوشت‌های فرآوری‌شده (کالباس، سوسیس)" },
      { icon: "🌡️", label: "نوشیدنی‌های بسیار داغ (بالاتر از ۶۵ درجه)" },
      { icon: "🌫️", label: "غذاهای دودی (کباب، ماهی دودی، برنج دودی)" },
    ].map((item, idx) => (
      <div
        key={idx}
        className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 border border-red-100"
      >
        <span className="text-base">❌</span>
        <span className="text-base">{item.icon}</span>
        <span className="text-sm text-gray-600">{item.label}</span>
      </div>
    ))}
  </div>
  </div>

    <div className="rounded-2xl border border-red-100 bg-gradient-to-br from-red-50 to-orange-50 p-4">
    <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-red-600">
      🚫 حذف عادت‌های ناسالم
    </h3>
    <p className="text-right text-xs leading-relaxed text-gray-500">
      عادت‌هایی وجود دارد که بهتر است در سبک زندگی روزانه حذف یا تا حد ممکن محدود شوند. این لیست کمک می‌کند تا آگاهانه‌تر انتخاب کنیم و به مرور زمان عادت‌های سالم‌تر را جایگزین رفتارهای نامناسب کنیم.
    </p>
  </div>

        {/* برنامه غذایی هفتگی */}
        {/* <ScaleSelector
          options={MEAL_PLANS}
          selected={selectedMeals}
          onChange={setSelectedMeals}
          maxSelection={7}
        /> */}

        {/* چک‌لیست هدف */}
        {/* <div className="space-y-3">
          <h4 className="text-sm font-semibold text-ink">🎯 حدف خاصتن اصلاحم:</h4>
          <div className="space-y-2 rounded-xl bg-gray-50 p-4">
            {[
              "تمسش آمماده (تسنی)",
              "میان‌وعده‌های غالم گفتیگومی",
              "دیکرگونهایش کل‌م دجندر بخوری تبک",
            ].map((item, i) => (
              <label key={i} className="flex items-center gap-3 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={checklist[item] || false}
                  onChange={(e) =>
                    setChecklist((prev) => ({ ...prev, [item]: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand"
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </div> */}

        {/* ردیابی هفتگی */}
        <WeeklyTracker label="نمک‌سنج روزانه" />
        <WeeklyTracker label="حذف عادت‌های ناسالم  " />
      </div>
    </AdviceSectionCard>
  );
}
