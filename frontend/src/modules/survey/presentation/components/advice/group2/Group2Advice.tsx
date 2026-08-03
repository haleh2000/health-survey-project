// src/modules/survey/presentation/components/advice/group3/Group3Advice.tsx
import type { RiskAssessment } from "@survey/domain/entities/risk-assessment.entity";
import { HealthAdviceBanner } from "../shared/HealthAdviceBanner";
import { WeeklyGoalsHeader } from "../shared/WeeklyGoalsHeader";
import { AdviceSectionCard } from "../shared/AdviceSectionCard";
import { RiskResultHeader } from "../shared/RiskResultHeader";
import { SectionHeader } from "../shared/SectionHeader";
import { RainbowFoodGuide } from "../shared/RainbowFoodGuide";
import DailyWaterTracker from "./DailyWaterTracker.tsx";
import HealthyEatingTracker from "./HealthyEatingTracker.tsx";


interface Group3AdviceProps {
  assessment: RiskAssessment;
  onPrint: () => void;
  onShare: () => void;
}

export function Group3Advice({ assessment, onPrint, onShare }: Group3AdviceProps) {
  return (
    <div className="flex flex-col gap-6">
      <RiskResultHeader assessment={assessment} />
      <div className="rounded-2xl bg-white">
        <HealthAdviceBanner />
        <WeeklyGoalsHeader
          title="راهکارهای طلایی هفتگی برای رسیدن به تعادل"
          bgColorClass="bg-yellow-100"
          textColorClass="text-yellow-700"
        />

        <AdviceSectionCard title="تغذیه سالم" imageSrc="" imageAlt="تغذیه" borderTitle="پیشنهادات تغذیه" backgroundColor="bg-white">
        
        <SectionHeader
            emoji="🧬"
            title="تنوع‌بخشی به رنگ‌دانه‌ها و ترکیبات مفید"
            titleColorClass="text-day-red"
            description="تمرکز بر رنگ‌های طبیعیِ میوه‌ها و سبزیجات (نه رنگ‌های مصنوعی)، ضامن دریافت طیف کاملی از آنتی‌اکسیدان‌های حیاتی است؛ ای زیستی با کاهش التهاتقویت سیستم ایمنی، سلامت متابولیک بدن را به‌طور مؤثری ارتقا می‌دهد."
         />
        
          <div className="py-10">
            <RainbowFoodGuide />
          </div>

          <SectionHeader
            emoji="💧"
            title=" پایش میزان مصرف آب"
            titleColorClass="text-day-red"
            description="نوشیدن ۸ لیوان (۲ لیتر) آب روزانه،نوشیدن آب نه‌تنها به سم‌زدایی و بهبود عملکرد متابولیک کمک می‌کند، بلکه باایجاد احساس سیری، میل به مصرف تنقلات و غذاهای پرریسک را به‌طور طبیعی کاهش داده و جایگزینی برای رفتارهای پرخوری محسوب می‌شود."
         />

         <DailyWaterTracker />

         <SectionHeader
            emoji="🚨"
            title="محدودسازی مواد غذایی پرریسک"
            titleColorClass="text-day-red"
            description="برخلاف حذف کامل که منجر به فشار روانی و شکست در هدف می‌شود، این رویکرد با ایجاد انعطاف‌پذیری، از احساس محرومیت جلوگیری کرده و تغییرات پایدار و ماندگاری در سبک زندگی ایجاد می‌کند."
         />

        <HealthyEatingTracker />
        
        </AdviceSectionCard>

      </div>

      <div className="flex gap-3">
        <button
          onClick={onShare}
          className="cursor-pointer flex-1 rounded-xl border-2 border-day-primary bg-white px-6 py-3 text-sm font-semibold text-day-primary hover:bg-day-primary hover:text-white"
        >
          اشتراک‌گذاری
        </button>
        <button
          onClick={onPrint}
          className="cursor-pointer flex-1 rounded-xl bg-day-primary px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
        >
          پرینت
        </button>
      </div>
    </div>
  );
}
