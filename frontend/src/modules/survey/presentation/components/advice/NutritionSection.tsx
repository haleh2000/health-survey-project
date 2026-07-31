// src/modules/survey/presentation/components/advice/NutritionSection.tsx
import { useState } from "react";
import { AdviceSectionCard } from "./AdviceSectionCard";
import { ScaleSelector } from "./ScaleSelector";
import { WeeklyTracker } from "./WeeklyTracker";
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

export function NutritionSection() {
  const [selectedMeals, setSelectedMeals] = useState<number[]>([]);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});

  return (
    <AdviceSectionCard
      title="پیشنهادات تغذیه"
      imageSrc={nutritionImg}
      imageAlt="شخصیت تغذیه"
    >
      <div className="space-y-6">
        {/* توضیح چگونگی حذف */}
        <div className="space-y-3 rounded-xl bg-rose-50 p-4">
          <h4 className="text-sm font-bold text-rose-700">
            🍽️ چگونگی حذف:
          </h4>
          <p className="text-sm leading-7 text-ink">
            یه مصرفی توسط بشمری گیهید بیسته صمود آبیو گوشت‌ لفوگلشید، سعی
            کودهک سدیم، نی‌شکر، وقدتید که‌پانک بدسازینگنت‌هگید.
          </p>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-ink">
              ممنوع یا بسیار محدود:
            </p>
            <ul className="mr-4 space-y-1 text-xs text-ink-subtle">
              <li>• سیگار</li>
              <li>• نمک</li>
              <li>• قندستاوند (شکر، رشمیدا و...)</li>
              <li>• فُوهستوس فرآورنده (کالانیس، سوسیس...)</li>
              <li>• نانها دوری (نگیاب، ماده خونی، مواج جوجو)</li>
            </ul>
          </div>
        </div>

        {/* برنامه غذایی هفتگی */}
        <ScaleSelector
          options={MEAL_PLANS}
          selected={selectedMeals}
          onChange={setSelectedMeals}
          maxSelection={7}
        />

        {/* چک‌لیست هدف */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-ink">
            🎯 حدف خاصتن اصلاحم:
          </h4>
          <div className="space-y-2 rounded-xl bg-gray-50 p-4">
            {[
              "تمسش آمماده (تسنی)",
              "میان‌وعده‌های غالم گفتیگومی",
              "دیکرگونهایش کل‌م دجندر بخوری تبک",
            ].map((item, i) => (
              <label
                key={i}
                className="flex items-center gap-3 text-sm text-ink"
              >
                <input
                  type="checkbox"
                  checked={checklist[item] || false}
                  onChange={(e) =>
                    setChecklist((prev) => ({
                      ...prev,
                      [item]: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand"
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </div>

        {/* ردیابی هفتگی */}
        <WeeklyTracker label="تمسستع روزانه" />
        <WeeklyTracker label="حدف عاوست‌های نامسنلام" />
      </div>
    </AdviceSectionCard>
  );
}
