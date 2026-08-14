// // src/modules/survey/presentation/components/advice/group4/Group4Advice.tsx
// import { useRef } from "react";
// import type { RiskAssessment } from "@survey/domain/entities/risk-assessment.entity";
// import { HealthAdviceBanner } from "../shared/HealthAdviceBanner";
// import { WeeklyGoalsHeader } from "../shared/WeeklyGoalsHeader";
// import { AdviceSectionCard } from "../shared/AdviceSectionCard";
// import diversifyingImg from "@survey/presentation/assets/advice/group4/diversifying-pigments.png";
// import { SpiceImmunitySection } from "./SpiceImmunitySection";
// import { DiversifyingColorsSection } from "./DiversifyingColorsSection";
// import { ImmunityShieldSection } from "./ImmunityShieldSection";
// import { SectionHeader } from "../shared/SectionHeader";
// import { RiskResultHeader } from "../shared/RiskResultHeader";
// import { RainbowFoodGuide } from "../shared/RainbowFoodGuide";
// import { PhysicalActivitySection } from "./PhysicalActivitySection";
// import activityImg from "@survey/presentation/assets/advice/group4/physicalActivitySection.png";
// import { WeeklyActivityPlanner } from "./WeeklyActivityPlanner";
// import { MindfulnessMeditationSection } from "./MindfulnessMeditationSection";
// import WeeklyExerciseTable from './WeeklyExerciseTable';
// import goodDayImg from "@survey/presentation/assets/advice/group4/good-day.png";
// import WeeklyGratitudePlanner from './WeeklyGratitudePlanner';
// import { usePdfDownload } from "../../../hooks/usePdfDownload";
// import logo from "@/assets/day-daydar-lockup.png";


// interface Group4AdviceProps {
//   assessment: RiskAssessment;
//   onShare: () => void;
// }

// export function Group4Advice({ assessment, onShare }: Group4AdviceProps) {
//   const contentRef = useRef<HTMLDivElement>(null);
//   const download = usePdfDownload(contentRef, logo);

//   return (
//     <div className="flex flex-col gap-6">
//       {/* <RiskResultHeader assessment={assessment} /> */}
//       <div ref={contentRef} className="rounded-2xl bg-white">
//         <HealthAdviceBanner />
//         <WeeklyGoalsHeader
//           title="راهکارهای طلایی هفتگی برای تثبیت سلامت"
//           bgColorClass="bg-green-100"
//           textColorClass="text-green-700"
//         />

//         <AdviceSectionCard
//           title="تغذیه سالم"
//           imageSrc=""
//           imageAlt="تغذیه"
//           borderTitle="پیشنهادات تغذیه"
//           backgroundColor="bg-white"
//         >
//           <SectionHeader
//             emoji="🧬"
//             title="تنوع‌بخشی به رنگ‌دانه‌ها و ترکیبات مفید"
//             titleColorClass="text-day-red"
//             description="تمرکز بر رنگ‌های طبیعیِ میوه‌ها و سبزیجات (نه رنگ‌های مصنوعی)، ضامن دریافت طیف کاملی از آنتی‌اکسیدان‌های حیاتی است؛ ای زیستی با کاهش التهاب و تقویت سیستم ایمنی، سلامت متابولیک بدن را به‌طور مؤثری ارتقا می‌دهد."
//           />

//           <div className="py-4">
//             <RainbowFoodGuide />
//           </div>

//           <div className="mt-10">
//             <img src={diversifyingImg} alt="شخصیت تغذیه" className="object-contain" />
//           </div>

//           <ImmunityShieldSection />
//           <SpiceImmunitySection />
//           <DiversifyingColorsSection />
//         </AdviceSectionCard>

//         <AdviceSectionCard
//           title="پیشنهادات ورزشی"
//           imageSrc=""
//           imageAlt="ورزش"
//           borderTitle="پیشنهادات ورزشی"
//           backgroundColor="bg-white"
//         >
//           <SectionHeader
//             emoji="🏁"
//             title="مقاصد اصلی"
//             titleColorClass="text-day-red"
//             description="این بخش قطب‌نمای شماست. هدف اصلی خود را اینجا بنویسید تا بدانید برای چه تلاش می‌کنید. ثبت رکوردها کمک می‌کند روند تغییرات و پیشرفت‌تان را به‌صورت واقعی مشاهده کنید."
//           />

//           <PhysicalActivitySection />

//           <div className="my-10">
//             <img src={activityImg} alt="برنامه ورزشی" className="object-contain" />
//           </div>

//           <SectionHeader
//             emoji="📅"
//             title="برنامه ورزشی هفتگی"
//             titleColorClass="text-day-red"
//             description="این برنامه، نقشه راه روزانه شماست. با مشخص کردن تمرینات هر روز، از سردرگمی جلوگیری می‌کنید و می‌توانید نظم تمرینی‌تان را حفظ کنید تا برای مقاصد اصلی در تمرین قبل آماده شوید."
//           />

//           <WeeklyActivityPlanner />
//         </AdviceSectionCard>

//         <AdviceSectionCard
//           title="پیشنهادات خود مراقبتی"
//           imageSrc=""
//           imageAlt="مدیتیشن"
//           borderTitle="پیشنهادات خود مراقبتی"
//           backgroundColor="bg-white"
//         >
//           <SectionHeader
//             emoji="🧘"
//             title=" ذهن آگاهی و مدیتیشن"
//             titleColorClass="text-day-red"
//             description="این بخش برای ثبت لحظات آرامش و تمرکز درونی طراحی شده است. با مقایسه وضعیت خود قبل و بعد از مدیتیشن، تاثیر این تمرین را بر کیفیت روحی خود بهتر خواهید سنجید."
//           />

//            <MindfulnessMeditationSection />

//            <WeeklyExerciseTable />

//            <div className="my-10">
//             <img src={goodDayImg} alt="برنامه ورزشی" className="object-contain" />
//           </div>

//           <SectionHeader
//             emoji="🌸"
//             title=" حال خوب روزانه"
//             titleColorClass="text-day-red"
//             description="هر روز فقط چند دقیقه برای مرور زیبایی‌های کوچک زندگی وقت بگذارید. این تمرین به شما کمک می‌کند با ذهنی آرام‌تر، شادتر و معنادارتر به اهداف برسید."
//           />

//           <WeeklyGratitudePlanner />

//         </AdviceSectionCard>
//       </div>

//       <div className="flex gap-3">
//         <button
//           onClick={onShare}
//           className="cursor-pointer flex-1 rounded-xl border-2 border-day-primary bg-white px-6 py-3 text-sm font-semibold text-day-primary hover:bg-day-primary hover:text-white"
//         >
//           اشتراک‌گذاری
//         </button>
//         <button
//           onClick={() => download()}
//           className="cursor-pointer flex-1 rounded-xl bg-day-primary px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
//         >
//           دانلود
//         </button>
//       </div>
//     </div>
//   );
// }

// src/modules/survey/presentation/components/advice/group1/Group1Advice.tsx
// Group4Advice.tsx
import type { RiskAssessment } from "@survey/domain/entities/risk-assessment.entity";
import type { SurveyAnswers } from "@survey/domain/entities/survey-answers.entity";
import type { BodyMetrics } from "@survey/domain/value-objects/body-metrics.vo";
import { AdviceLayout } from "../shared/AdviceLayout";

interface Props {
  assessment: RiskAssessment;
  answers: SurveyAnswers;
  bodyMetrics: BodyMetrics | null;
  onShare: () => void;
}

export function Group4Advice({ assessment, answers, bodyMetrics, onShare }: Props) {
  return (
    <AdviceLayout
      assessment={assessment}
      answers={answers}
      bodyMetrics={bodyMetrics}
      onShare={onShare}
    />
  );
}

