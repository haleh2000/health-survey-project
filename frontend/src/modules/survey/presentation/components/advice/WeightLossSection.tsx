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
      imageSrc={weightLossImg}
      imageAlt="شخصیت کاهش وزن"
      backgroundColor="bg-gradient-to-br from-green-50 to-lime-50"
    >
      <div className="space-y-6">
        {/* توضیح */}
        <div className="rounded-xl bg-amber-50 p-4">
          <h4 className="mb-2 text-sm font-bold text-amber-900">
            ☀️ کاهش شرن کد‌بار و اکلاحات کورخبید مه به یار IMI=۳۰=۳۵ باقیمنی
          </h4>
          <p className="text-sm leading-7 text-ink">
            الیرودردیں بخیک سحتون، سیمئل سے کالَی میرالُنستچیں رددنیٖگیںمَستی
            بدنای‌نیکیں.
          </p>
        </div>

        {/* راهکارهای پیشنهادی */}
        <div>
          <p className="mb-3 text-sm font-semibold text-ink">
            راهکارهای پیشنهادی برای تغییری روزانه پس کالری:
          </p>
          <ScaleSelector
            options={WEIGHT_ACTIVITIES}
            selected={selectedActivities}
            onChange={setSelectedActivities}
            maxSelection={3}
          />
        </div>

        {/* نکات مهم */}
        <div className="space-y-2 rounded-xl bg-blue-50 p-4">
          <p className="text-xs font-semibold text-blue-900">💡 نکات مهم:</p>
          <ul className="mr-4 space-y-1 text-xs leading-6 text-ink-subtle">
            <li>
              <span className="font-semibold">💪</span> عضور بریدین (بکنبا شبتہ،
              باہوب): بتاں ۳ روک رٹکت کیجیدیگری کٹگری گرے بیژون کنید
            </li>
            <li>
              <span className="font-semibold">🍊</span> گنوایل خودین و شبونی
              (میگہ کالُری)=بکایکِ۔ بہ یک روئیہ حکیلی کوالے گسترمگوم از
            </li>
            <li>
              <span className="font-semibold">💧</span> نوشیروکولینا (۸–۱۰
              لیوان): سدسی آیکریہ بافقا‌یپہ شیستے گوتا‌گینبِہِگاتیںہ راںش
            </li>
          </ul>
        </div>

        {/* ردیابی هفتگی */}
        <WeeklyTracker label="فقایتل روزانہ (فعل دقیقہ)" />
      </div>
    </AdviceSectionCard>
  );
}
