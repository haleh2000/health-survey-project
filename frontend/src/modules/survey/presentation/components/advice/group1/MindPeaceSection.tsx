// src/modules/survey/presentation/components/advice/MindPeaceSection.tsx
import { AdviceSectionCard } from "../shared/AdviceSectionCard";
// import { DailyNoteField } from "./DailyNoteField";
import { MoodTracker } from "../../../assets/advice/group1/mood/MoodTracker";
import mindPeaceImg from "@survey/presentation/assets/advice/group1/mind-peace-character.png";
import { SectionHeader } from "../shared/SectionHeader";
import { NoteFields } from "../shared/DailyNoteField";



export const RELAXATION_OPTIONS = [
  "تمرین مدیتیشن، خط ساعت، حداقل ۱۰ دقیقه در روز",
  "یک وقت خود را به خانواده و دوستان سپری کنید",
  "تنفس عمیق (۴ ثانیه نفس بکشید، ۴ ثانیه نگه دارید، ۴ ثانیه رها کنید)",
  "پیاده‌روی آرام در طبیعت (پارک، فضای سبز)",
  "گوش دادن به موسیقی آرام‌بخش",
  "ژورنالینگ یا نوشتن افکار خود",
  "یوگا یا کشش عضلات",
];

export function MindPeaceSection() {

  return (
    <AdviceSectionCard
      title="پیشنهادات آرامش ذهن و خودمراقبتی"
      borderTitle="پیشنهادات آرامش ذهن و خودمراقبتی"
      imageSrc={mindPeaceImg}
      imageAlt="شخصیت آرامش ذهن"
      
    >
      <div className="space-y-6">
        <SectionHeader
            emoji="🕯️"
            title="ذهن آگاهی"
            titleColorClass="text-day-red"
            description="این تکنیک با درگیر کردن ۵ حس، توجه مغز را از افکار اضطرابی به محیط اطراف برمی‌گرداند و به سیستم عصبی کمک می‌کند احساس امنیت بیشتری داشته باشد؛ در نتیجه اضطراب، ضربان قلب و تنفس به‌تدریج آرام‌تر می‌شوند."
         />

        <div  >
          <div className="leading-7 mb-3 text-sm font-semibold text-gray-500">
             <span className="mr-1 space-y-2">روش اجرا: </span>
             <ul>
              <li>👁️ ۵ چیزی که می‌بینی را نام ببر. </li>
              <li>🖐️ ۴ چیزی که می‌توانی لمس کنی را حس کن.  </li>
             </ul>
          </div>
          
        </div>

        <div className="my-10">
         <img src={mindPeaceImg} alt="ذهن آگاهی" className="object-contain" />
          </div>

           <SectionHeader
            emoji="✍️"
            title="شکرگزاری شبانه"
            titleColorClass="text-day-red"
            description="این تمرین مغز را از چرخه «نشخوار فکری» خارج کرده و با استفاده از قانون «پایانِ خوش»، شما روز خود را با یادآوری اتفاقات خوب به پایان می‌رسانید؛ این کار باعث می‌شود خاطره‌ی کلِ روز در ذهن شما مثبت‌تر ثبت شود."
         />

         <p className="text-gray-600">۳ چیز خوبی که امروز اتفاق افتاد:</p>

       <NoteFields labels={["شنبه", "یک‌شنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"]} />

        {/* ردیابی خلق‌وخو */}
        <MoodTracker />

      </div>
    </AdviceSectionCard>
  );
}
