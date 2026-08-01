// src/modules/survey/presentation/components/advice/WeightLossSection.tsx
import { useState } from "react";
import { AdviceSectionCard } from "./AdviceSectionCard";
import { ScaleSelector } from "./ScaleSelector";
import { WeeklyTracker } from "./WeeklyTracker";
import weightLossImg from "@survey/presentation/assets/advice/group1/weight-loss-character.png";

const WEIGHT_ACTIVITIES = [
  "کاهش وزن پایدار با اصلاحات کوچک نه به‌ج IMI=۲۵ تا ۳۰ پایینی",
  "الیروبیک سجک و ماژون، سمئل سے کالی مراست سے وصزی بدنی‌های دیکرهای گفتیدن نام و ثرن وی نی‌فسترای",
  "عکس بصیر روک بنخت (بلهنذ، ټخیر، باریں ګدینگ کڑگی اگتریخت)",
  "معرفی پیک‌ویروبی (۴۰–۶۰ کالری): استفاده از آیتووم بازلیا‌با به سینت منا کیلوباگیت اراگتتوگال وسایل بریما سے",
  "حددهای پریتایب (۱۰=۱۵ کالری): استفاده از گتپریمچون، تانیہ ۱ بہ کرامیدگیتہادین بہات جا بریذہ)",
  "کشتار فشار خون و بیماری‌های قلبی را بسنیری بوخمروین",
  "دگشتن فشندر خون و بسزئری فندی را بمد بتبوکنید",
];

export function WeightLossSection() {
  const [selectedActivities, setSelectedActivities] = useState<number[]>([]);

  return (
    <AdviceSectionCard
      title="پیشنهادات کاهش وزن"
      borderTitle="پیشنهادات کاهش وزن"
      imageSrc={weightLossImg}
      imageAlt="شخصیت کاهش وزن"
    >
      <div className="space-y-6">
        {/* توضیح */}
       <div className="flex">
      <ul className="space-y-1 text-sm text-gray-700">
        <li className="flex items-center gap-2">
          <span className="text-2xl">📉</span>
          <span className="text-day-red text-lg font-bold mb-2">
            کاهش وزن پایدار با اصلاحات کوچک (فقط اگر BMI بیشتر از ۲۵ باشد)
          </span>
        </li>
        <li className="flex items-center gap-2"><span>این روش به جای شوک دادن به بدن، با اصلاحات کوچک و پایدار، کسری انرژی لازم را برای کاهش ۳۰۰ گرم در هفته (۱.۲ کیلوگرم در ماه) با حذف ۵۰۰ کالری در روز فراهم می‌کند؛ بدون اینکه متابولیسم شما افت کند یا دچار گرسنگی عصبی شوید.</span></li>
      </ul>
    </div>

        {/* راهکارهای کاهش ۵۰۰ کالری */}
<div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
  <h3 className="mb-3 text-sm font-bold text-teal-700">
    📉 راهکارهای پیشنهادی برای کاهش روزانه ۵۰۰ کالری
  </h3>

  <div className="flex flex-col gap-2">
    {[
      { emoji: "🥤", title: "حذف نوشیدنی‌های قندی", cal: "۱۵۰ کالری", desc: "مصرف آب، آب‌گازدار با لیمو یا چای بدون قند" },
      { emoji: "🍳", title: "تغییر روش پخت", cal: "۱۵۰ کالری", desc: "بخارپز، کبابی یا گریل کردن 🔄 سرخ‌کردن" },
      { emoji: "🍰", title: "محدود کردن دسر و شیرینی", cal: "۲۰۰ کالری", desc: "جایگزینی با یک واحد میوه کامل (سرشار از فیبر)" },
      { emoji: "🧴", title: "حذف سس‌های پرچرب", cal: "۱۰۰–۱۵۰ کالری", desc: "آبلیمو، بالزامیک یا ماست یونانی 🔄 مایونز" },
      { emoji: "🍚", title: "کاهش کربوهیدرات ساده", cal: "۱۵۰–۲۰۰ کالری", desc: "نصف کردن سهم برنج یا نان و پر کردن بشقاب با سبزیجات" },
      { emoji: "🥛", title: "انتخاب لبنیات کم‌چرب", cal: "۱۰۰ کالری", desc: "جایگزینی شیر و ماست پرچرب با نسخه‌های کم‌چرب" },
      { emoji: "🚶", title: "پیاده‌روی روزانه", cal: "۱۰۰ کالری", desc: "حدود ۲۰ دقیقه با سرعت متوسط (در صورت فشار خون یا بیماری قلبی با پزشک مشورت کنید)" },
    ].map(({ emoji, title, cal, desc }) => (
      <div key={title} className="flex items-start gap-2 rounded-xl border border-emerald-100 bg-white/70 px-3 py-2">
        <span className="text-lg">{emoji}</span>
        <div className="flex-1 text-right">
          <span className="text-xs font-bold text-teal-700">{title} </span>
          <span className="text-xs text-emerald-600">({cal})</span>
          <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{desc}</p>
        </div>
      </div>
    ))}
  </div>
</div>


        {/* ردیابی هفتگی */}
        <WeeklyTracker label="کاهش روزانه ۵۰۰ کالری" />
      </div>
    </AdviceSectionCard>
  );
}