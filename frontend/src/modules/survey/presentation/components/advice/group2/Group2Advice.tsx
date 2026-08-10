// src/modules/survey/presentation/components/advice/group2/Group2Advice.tsx
import { useRef } from "react";
import type { RiskAssessment } from "@survey/domain/entities/risk-assessment.entity";
import { HealthAdviceBanner } from "../shared/HealthAdviceBanner";
import { WeeklyGoalsHeader } from "../shared/WeeklyGoalsHeader";
import { AdviceSectionCard } from "../shared/AdviceSectionCard";
import { SectionHeader } from "../shared/SectionHeader";
import { RainbowFoodGuide } from "../shared/RainbowFoodGuide";
import DailyWaterTracker from "./DailyWaterTracker.tsx";
import HealthyEatingTracker from "./HealthyEatingTracker.tsx";
import whoStandard from "@survey/presentation/assets/advice/group2/who-standard.png";
import smart from "@survey/presentation/assets/advice/group2/smart.png";
import WeeklyActivityGoal from "./WeeklyActivityGoal.tsx";
import SmartGoalGuide from "./SmartGoalGuide.tsx";
import { NoteFields } from "../shared/DailyNoteField";
import { WeeklyHabitTracker } from "./WeeklyHabitTracker";
import { SlipRecoveryGuide } from "./SlipRecoveryStep.tsx";
import { usePdfDownload } from "../../../hooks/usePdfDownload";
import logo from "@/assets/day-daydar-lockup.png";

interface Group2AdviceProps {
  assessment: RiskAssessment;
  onShare: () => void;
}

export function Group2Advice({ assessment, onShare }: Group2AdviceProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const download = usePdfDownload(contentRef, logo);

  return (
    <div className="flex flex-col gap-6">
      <div ref={contentRef} className="rounded-2xl bg-white">
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
            description="تمرکز بر رنگ‌های طبیعیِ میوه‌ها و سبزیجات (نه رنگ‌های مصنوعی)، ضامن دریافت طیف کاملی از آنتی‌اکسیدان‌های حیاتی است؛ این تنوع زیستی با کاهش التهاب و تقویت سیستم ایمنی، سلامت متابولیک بدن را به‌طور مؤثری ارتقا می‌دهد."
          />

          <div className="py-2">
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

        <AdviceSectionCard title="پیشنهادات ورزشی" imageSrc="" imageAlt="ورزش" borderTitle="پیشنهادات ورزشی" backgroundColor="bg-white">

          <SectionHeader
            emoji="💪"
            title="فعالیت بدنی | استاندارد WHO"
            titleColorClass="text-day-red"
            description="سازمان جهانی بهداشت(World Health Organization - WHO)حداقل فعالیت بدنی هفتگی برای بزرگسالان را شامل ۱۵۰ دقیقه فعالیت هوازی با شدت متوسط، مانند پیاده‌روی سریع، به‌همراه ۲ جلسه تمرین قدرتی توصیه می‌کند.تمرینات قدرتی می‌توانند شامل حرکاتی مانند اسکوات، پوش‌آپ و پلانک، با وزن بدن، کش مقاومتی یا وزنه باشند."
          />

          <div className="relative my-10">
            <img src={whoStandard} alt="استاندارد who" className="w-full h-auto" />
          </div>

          <WeeklyActivityGoal />

        </AdviceSectionCard>

        <AdviceSectionCard title="پیشنهادات برنامه‌ریزی" imageSrc="" imageAlt=" برنامه‌ریزی" borderTitle="پیشنهادات برنامه‌ریزی و خود مراقبتی" backgroundColor="bg-white">

          <SectionHeader
            emoji="🗺️"
            title=" نقشه اهداف SMART"
            titleColorClass="text-day-red"
            description="این تکنیک اهداف انتزاعی را به برنامه‌هایی دقیق و قابل اجرا تبدیل می‌کند. با رعایت این ۵ معیار، ابهام از مسیر برداشته شده و تمرکز بر دستاوردهای واقعی و منطقی جایگزین رویاپردازی می‌شود."
          />

          <SmartGoalGuide />

          <NoteFields
            labels={["اهداف ماهانه من"]}
            gridCols={1}
            lineCount={4}
          />

          <div className="relative my-10">
            <img src={smart} alt="استاندارد who" className="w-full h-auto" />
          </div>

          <SectionHeader
            emoji="🔄"
            title="تکنیک بازگشت به مسیر"
            titleColorClass="text-day-red"
            description="این تکنیک برای زمانی است که برنامه‌ریزی‌های شخصی شما طبق انتظار پیش نمی‌رود. به‌جای سرزنش یا رها کردن کامل، کمک می‌کند علت لغزش را سریع پیدا کنید، یک اقدام کوچک انجام دهید و از همان روز یا فردا به مسیر برگردید."
          />

          <p className="text-gray-500 font-bold text-sm leading-7">
            مثال استفاده از روش در برنامه‌ریزی برای ورزش:
            <br />امروز ورزشم انجام نشد، چون خسته بودم و برنامه را به آخر شب موکول کردم. به‌جای رها کردن کامل، ۵ دقیقه کشش سبک انجام می‌دهم و برای فردا ۱۵ دقیقه پیاده‌روی بعد از صبحانه می‌گذارم.
          </p>

          <WeeklyHabitTracker />

          <SlipRecoveryGuide />

        </AdviceSectionCard>

      </div>

      <div className="flex gap-2 sm:gap-3">
        <button
          onClick={onShare}
          className="focus-visible:!outline-none cursor-pointer flex-1 rounded-xl border-2 border-day-primary bg-white px-3 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-day-primary hover:bg-day-primary hover:text-white"
        >
          اشتراک‌گذاری
        </button>
        <button
          onClick={() => download()}
          className="focus-visible:!outline-none cursor-pointer flex-1 rounded-xl bg-day-primary px-3 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white hover:opacity-90"
        >
          دانلود
        </button>
      </div>
    </div>
  );
}
