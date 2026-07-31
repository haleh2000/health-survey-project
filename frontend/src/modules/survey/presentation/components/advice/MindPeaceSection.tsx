// src/modules/survey/presentation/components/advice/MindPeaceSection.tsx
import { useState } from "react";
import { AdviceSectionCard } from "./AdviceSectionCard";
import { ScaleSelector } from "./ScaleSelector";
import { DailyNoteField } from "./DailyNoteField";
import { MoodTracker } from "./MoodTracker";
import mindPeaceImg from "@survey/presentation/assets/advice/group1/mind-peace-character.png";

const RELAXATION_OPTIONS = [
  "تمرین مدیتیشن، خط ساعت، حداقل ۱۰ دقیقه در روز",
  "یک وقت خود را به خانواده و دوستان سپری کنید",
  "تنفس عمیق (۴ ثانیه نفس بکشید، ۴ ثانیه نگه دارید، ۴ ثانیه رها کنید)",
  "پیاده‌روی آرام در طبیعت (پارک، فضای سبز)",
  "گوش دادن به موسیقی آرام‌بخش",
  "ژورنالینگ یا نوشتن افکار خود",
  "یوگا یا کشش عضلات",
];

export function MindPeaceSection() {
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);

  return (
    <AdviceSectionCard
      title="پیشنهادات آرامش ذهن و خودمراقبتی"
      imageSrc={mindPeaceImg}
      imageAlt="شخصیت آرامش ذهن"
    >
      <div className="space-y-6">
        {/* توضیحات */}
        <div className="rounded-xl bg-pink-50 p-4">
          <p className="text-sm leading-7 text-ink">
            <span className="font-semibold">آگاهی و توجه‌به خویشتن:</span> کلید
            اصلی مدیریت مزمن این است. تکنیک‌هایی مانند{" "}
            <span className="font-semibold">نفس عمیق</span>،{" "}
            <span className="font-semibold">مدیتیشن</span> و یا{" "}
            <span className="font-semibold">یوگا</span> به‌طور مؤثری از راهکارهای
            بروزیدن و اتفاق در تفکر می‌آیند و در نتیجه این کار، مغز شما باعث
            بهبود ترکیدسبر یبسته رسیدیم بگیرید آزمایش‌های اجتماعی و چنگمن
            امدیترو با متشق بگدصادی ای در مجموعه‌ای از راهکارها را بررسی و
            اتفاقد که بررسیدم قبل باشد.
          </p>
        </div>

        {/* انتخاب راهکارها */}
        <div>
          <p className="mb-3 text-sm font-semibold text-ink">
            🧘 <span className="mr-1">تقنیک آریگال یک و خروج کردن:</span>
          </p>
          <ScaleSelector
            options={RELAXATION_OPTIONS}
            selected={selectedOptions}
            onChange={setSelectedOptions}
            maxSelection={3}
          />
        </div>

        {/* روش اجرا */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-ink">روش اجرا:</p>
          <ul className="mr-5 space-y-2 text-sm text-ink-subtle">
            <li className="flex gap-2">
              <span>🧘</span>
              <span>هر روز در یک زمانی با ۱۰ تا ۲۰ دقیقه تمرین کنید</span>
            </li>
            <li className="flex gap-2">
              <span>🎵</span>
              <span>
                نشستن در محیط آرام، تمرکز روی نفس، گوش دادن موسیقی ملایم
              </span>
            </li>
            <li className="flex gap-2">
              <span>💭</span>
              <span>هر روک در نه شنبه هدست با استفاده‌ی کنید</span>
            </li>
            <li className="flex gap-2">
              <span>✍️</span>
              <span>نوشتن حس‌های روزانه را بسی کنید</span>
            </li>
            <li className="flex gap-2 text-xs italic">
              <span>💡</span>
              <span>هر نهایت بعد کشیدن تمرین دقیق باشگاری</span>
            </li>
          </ul>
        </div>

        {/* یادداشت روزانه */}
        <DailyNoteField />

        {/* ردیابی خلق‌وخو */}
        <MoodTracker />
      </div>
    </AdviceSectionCard>
  );
}
