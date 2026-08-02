// src/modules/survey/presentation/components/advice/MindPeaceSection.tsx
import { useState } from "react";
import { AdviceSectionCard } from "../shared/AdviceSectionCard";
import { DailyNoteField } from "./DailyNoteField";
import { MoodTracker } from "../../../assets/advice/group1/mood/MoodTracker";
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
      borderTitle="پیشنهادات آرامش ذهن و خودمراقبتی"
      imageSrc={mindPeaceImg}
      imageAlt="شخصیت آرامش ذهن"
      
    >
      <div className="space-y-6">
        {/* توضیحات */}
        <div className="flex">
            <ul className="space-y-1 text-sm text-gray-700">
              <li className="flex items-center gap-2"><span className="text-2xl">🕯️</span><span className="text-day-red text-lg font-bold">ذهن آگاهی</span></li>
              <li className="flex items-center gap-2"><span>این تکنیک با درگیر کردن ۵ حس، توجه مغز را از افکار اضطرابی به محیط اطراف برمی‌گرداند و به سیستم عصبی کمک می‌کند احساس امنیت بیشتری داشته باشد؛ در نتیجه اضطراب، ضربان قلب و تنفس به‌تدریج آرام‌تر می‌شوند.</span></li>
              </ul>
        </div>

        <div  >
          <div className="leading-7 mb-3 text-sm font-semibold text-gray-500">
             <span className="mr-1 space-y-2">روش اجرا: </span>
             <ul>
              <li>👁️ ۵ چیزی که می‌بینی را نام ببر. </li>
              <li>🖐️ ۴ چیزی که می‌توانی لمس کنی را حس کن.  </li>
             </ul>
          </div>
          
        </div>

        <div className="mt-6">
         <img src={mindPeaceImg} alt="شخصیت تغذیه" className="object-contain" />

          </div>

        

        <DailyNoteField />

        {/* ردیابی خلق‌وخو */}
        <MoodTracker />

      </div>
    </AdviceSectionCard>
  );
}
