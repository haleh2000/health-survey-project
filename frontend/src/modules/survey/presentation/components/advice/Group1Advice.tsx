// src/modules/survey/presentation/components/advice/Group1Advice.tsx
import { MindPeaceSection } from "./MindPeaceSection";
import { NutritionSection } from "./NutritionSection";
import { WeightLossSection } from "./WeightLossSection";

interface Group1AdviceProps {
  onPrint: () => void;
  onShare: () => void;
}

function HealthAdviceBanner() {
  return (
    <div className=" px-6 py-6">
      <p className="text-sm text-main-text ">
        پیشنهادات تخصصی ما بر اساس تحلیل سلامت شما آماده است ✨
      </p>
      <p className="mt-3 text-sm leading-7 text-day-primary">
        آگاهی از وضعیت کنونی، کلید اصلی مدیریت صحیح آن است. کافی است این
        راهکارها را به روتین زندگی خود وارد کنید تا کنترل اوضاع را در دست
        بگیرید.
      </p>
      <p className="mt-3 text-sm text-main-text leading-7 ">
        ما برای شما مجموعه‌ای از راهکارهای کاربردی را آماده کرده‌ایم و در کنار آن، یک <b>پلنر هفتگی اختصاصی</b> تدارک دیده‌ایم. پیشنهاد می‌کنیم این گزارش را به‌صورت هفتگی <b>پایانرینت بگیرید یا روی گوشی خود ذخیره کنید</b>؛ هر زمان که <b>حتی یک قدم کوچک </b>برداشتید، آن را علامت بزنید تا در پایان هر هفته، <b>روند پیشرفت و تغییرات مثبت</b> خود را به وضوح مشاهده کنید. 
      </p>
      <div className="mt-6 border-t border-gray-200" />
    </div>
  );
}

function WeeklyGoalsHeader() {
  return (
<div className="flex justify-center">
  <div className="inline-block mt-4 bg-day-red/20 px-4">
    <h2 className="relative -top-3 text-lg font-bold text-day-red whitespace-nowrap">
      راهکارهای طلایی هفتگی برای رسیدن به تعادل
    </h2>
  </div>
</div>
  );
}



export function Group1Advice({ onPrint, onShare }: Group1AdviceProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl bg-gradient-to-l from-pink-100 to-pink-200 px-6 py-8 text-center">
        <h2 className="text-xl font-bold text-black">
          ۱. گروه پر ریسک (با بیماری قطعی)
        </h2>
      </div>

      <div className="rounded-2xl bg-white">
        <HealthAdviceBanner />
        <WeeklyGoalsHeader />
        <NutritionSection />
        <WeightLossSection />
        <MindPeaceSection />
        
      </div>

      <div className="flex gap-3">
        <button
          onClick={onShare}
          className="flex-1 rounded-xl border-2 border-cyan-400 bg-white px-6 py-3 text-sm font-semibold text-cyan-700 hover:bg-cyan-50"
        >
          اشتراک‌گذاری
        </button>
        <button
          onClick={onPrint}
          className="flex-1 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
        >
          پرینت
        </button>
      </div>
    </div>
  );
}

