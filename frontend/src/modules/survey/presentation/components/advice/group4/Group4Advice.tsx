// src/modules/survey/presentation/components/advice/group4/Group4Advice.tsx
import type { RiskAssessment } from "@survey/domain/entities/risk-assessment.entity";
import { HealthAdviceBanner } from "../shared/HealthAdviceBanner";
import { WeeklyGoalsHeader } from "../shared/WeeklyGoalsHeader";
import { AdviceSectionCard } from "../shared/AdviceSectionCard";
import diversifyingImg from "@survey/presentation/assets/advice/group2/diversifying-pigments.png";
import { SpiceImmunitySection } from "./SpiceImmunitySection";
import { DiversifyingColorsSection } from "./DiversifyingColorsSection";
import { ImmunityShieldSection } from "./ImmunityShieldSection";
import { SectionHeader } from "../shared/SectionHeader";
import { RiskResultHeader } from "../shared/RiskResultHeader";
import { RainbowFoodGuide } from "./RainbowFoodGuide";



interface Group4AdviceProps {
  assessment: RiskAssessment;
  onPrint: () => void;
  onShare: () => void;
}

export function Group4Advice({ assessment, onPrint, onShare }: Group4AdviceProps) {
  return (

    <div className="flex flex-col gap-6">
      <RiskResultHeader assessment={assessment} />
      <div className="rounded-2xl bg-white">
        <HealthAdviceBanner />
        <WeeklyGoalsHeader
          title="راهکارهای طلایی هفتگی برای تثبیت سلامت"
          bgColorClass="bg-green-100"
          textColorClass="text-green-700"
        />

        <AdviceSectionCard
          title="تغذیه سالم"
          imageSrc=""
          imageAlt="تغذیه"
          borderTitle="پیشنهادات تغذیه"
          backgroundColor="bg-white"
        >

            <SectionHeader
            emoji="🧬"
            title="تنوع‌بخشی به رنگ‌دانه‌ها و ترکیبات مفید"
            titleColorClass="text-day-red"
            description="تمرکز بر رنگ‌های طبیعیِ میوه‌ها و سبزیجات (نه رنگ‌های مصنوعی)، ضامن دریافت طیف کاملی از آنتی‌اکسیدان‌های حیاتی است؛ ای زیستی با کاهش التهاب و تقویت سیستم ایمنی، سلامت متابولیک بدن را به‌طور مؤثری ارتقا می‌دهد."
            />

            <div className="py-10">
            <RainbowFoodGuide />

            </div>

            <DiversifyingColorsSection />
    

            <div className="mt-10">
         <img src={diversifyingImg} alt="شخصیت تغذیه" className="object-contain" />

          </div>

           <ImmunityShieldSection />
            
            <SpiceImmunitySection />

        </AdviceSectionCard>

        
      </div>

      <div className="flex gap-3">
        <button
          onClick={onShare}
          className="cursor-pointer flex-1 rounded-xl border-2 bg-white px-6 py-3 text-sm font-semibold text-cyan-700 hover:bg-day-primary hover:text-white"
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
