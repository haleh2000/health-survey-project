// src/modules/survey/presentation/components/advice/group3/Group3Advice.tsx
import { useRef } from "react";
import { AdviceSectionCard } from "../shared/AdviceSectionCard";
import { HealthAdviceBanner } from "../shared/HealthAdviceBanner";
import { WeeklyGoalsHeader } from "../shared/WeeklyGoalsHeader";
import type { RiskAssessment } from "@survey/domain/entities/risk-assessment.entity";
import { SectionHeader } from "../shared/SectionHeader";
import { NutritionHabitTracker } from "./NutritionHabitTracker";
import homeNutrition from "@survey/presentation/assets/advice/group3/home-nutrition.png";
import { MediterraneanPlateSection } from "../shared/MediterraneanPlateSection";
import { CalorieSwapList } from "./CalorieSwapList";
import weightLoss from "@survey/presentation/assets/advice/group3/weightLoss.png";
import { ExercisePhasePlanner } from "./ExercisePhasePlanner";
import { DailyWorkTracker } from "./DailyWorkTracker";
import Pomodoro from "@survey/presentation/assets/advice/group3/Pomodoro.png";
import { MobileFreeZones } from "./MobileFreeZones";
import { WeeklyCategoryGuide, type CategoryGroup } from "../shared/WeeklyCategoryGuide";
import { usePdfDownload } from "../../../hooks/usePdfDownload";
import logo from "@/assets/day-daydar-lockup.png";

interface Group3AdviceProps {
  assessment: RiskAssessment;
  onPrint: () => void;
  onShare: () => void;
}

const CHECKPOINT_GROUPS: CategoryGroup[] = [
  { label: "morning" },
  { label: "food" },
  { label: "deep-work" },
  { label: "conversation" },
  { label: "night" },
];

const CHECKPOINT_LABELS: Record<string, string> = {
  morning: "صبح",
  food: "غذا",
  "deep-work": "کار عمیق",
  conversation: "گفتگو",
  night: "شب",
};

export function Group3Advice({ assessment, onPrint, onShare }: Group3AdviceProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const download = usePdfDownload(contentRef, logo);

  return (
    <div className="flex flex-col gap-6">
      <div ref={contentRef} className="rounded-2xl bg-white">
        <HealthAdviceBanner />
        <WeeklyGoalsHeader
          title="راهکارهای طلایی هفتگی برای حفظ و ارتقای سلامت"
          bgColorClass="bg-[#ff6900]/20"
          textColorClass="text-[#ff6900]"
        />

        <AdviceSectionCard title="تغذیه سالم" imageSrc="" imageAlt="تغذیه" borderTitle="پیشنهادات تغذیه" backgroundColor="bg-white">
          <SectionHeader
            emoji="🥗"
            title="‍ اهمیت دادن به تغذیه‌ی خانگی"
            titleColorClass="text-day-red"
            description="پخت‌وپز خانگی با کنترل مستقیم بر کیفیت مواد اولیه و چربی‌ها، از ورود مواد افزودنی و چربی‌های ترانس جلوگیری می‌کند. این رویکرد با تامین سوخت استاندارد، ثبات انرژی و بهینه‌سازی عملکرد گوارش را تضمین می‌کند."
          />
          <NutritionHabitTracker />
          <div className="relative my-10">
            <img src={homeNutrition} alt="تغذیه‌ی خانگی who" className="w-full h-auto" />
          </div>
          <MediterraneanPlateSection />
        </AdviceSectionCard>

        <AdviceSectionCard title="ورزش" borderTitle="پیشنهادات کاهش وزن و ورزش" backgroundColor="bg-white">
          <SectionHeader
            emoji="📉"
            title="‍ کاهش وزن پایدار با اصلاحات کوچک(فقط اگر ۲۵ < BMI باشد)"
            titleColorClass="text-day-red"
            description="این روش به جای شوک و تغییر ناگهانی، با اصلاح تغذیه، سوخت و ساز بدن شما را در سطح پایداری نگه می‌دارد. کالری‌ های اضافی را حذف و با مواد مغذی جایگزین می‌کند. این یعنی بدون گرسنگی یا افت انرژی، سلامت عمومی شما در درازمدت تضمین می‌شود و همیشه در وضعیت بدنی ایده‌آل می‌مانید."
          />
          <CalorieSwapList />
          <div className="relative my-10">
            <img src={weightLoss} className="w-full h-auto" />
          </div>
          <SectionHeader
            emoji="💪"
            title="نقشه راه ۱۲ هفته‌ای: تغییر ترکیب بدنی"
            titleColorClass="text-day-red"
            description="این سیستم شی هوشمند با استفاده از روش علمی دوره بندی تمرین کمک می کند کاهش کالری باعث افت متابولیسم یا تحلیل عضلانی نشود.این روش در کنار رژیم غذایی سالم بهتر عمل می کند. هدف این برنامه در ۱۲ هفته کاملا حفظ حجم عضلانی و افزایش چربی سوزی است."
          />
          <ExercisePhasePlanner />
        </AdviceSectionCard>

        <AdviceSectionCard title=" توسعه فردی" borderTitle="پیشنهادات توسعه فردی و خود مراقبتی" backgroundColor="bg-white">
          <SectionHeader
            emoji="🍅"
            title="پومدورو تمرکز"
            titleColorClass="text-day-red"
            description="اگر شروع مطالعه، یادگیری یا کار روی اهداف شخصی ب سخت است یا وسط مسیر زود خسته می شویم، تکنیک پومودورو می تواند کمک کند. در این روش، فعالیت را به بازه های کوتاه و قابل انجام تقسیم می کنند: ۲۵ دقیقه تمرکز کامل و ۵ دقیقه استراحت. این مدل باعث می شود شروع کار راحت تر شود، فشار ذهنی کمتر شود و تمرکز در طول روز پایدار بماند."
          />
          <DailyWorkTracker />
          <div className="relative my-10">
            <img src={Pomodoro} alt="pomdoro" className="w-full h-auto" />
          </div>
          <SectionHeader
            emoji="📵"
            title="مدیرت مرزهای دیجیتال"
            titleColorClass="text-day-red"
            description="تعیین مرز، گوشی را از عامل حواس‌پرتی به ابزار هدفمند تبدیل می‌کند. با عبور از حالت «واکنش‌گر» به «کنترل‌گر»، سکان زمان و توجه در دست شماست. نتیجه آن کاهش استرس، جلوگیری از بمباران اطلاعات، افزایش تمرکز عمیق، خواب باکیفیت و حضور واقعی در لحظه است."
          />
          <MobileFreeZones />
          <WeeklyCategoryGuide
            groups={CHECKPOINT_GROUPS}
            getTrackerLabel={(group) => CHECKPOINT_LABELS[group.label] ?? group.label}
          />
          <div className="my-8 bg-amber-50 border-r-4 border-amber-400 rounded-xl p-4 text-right">
            <p className="text-amber-800 text-sm font-medium leading-relaxed">
              ✨ نکته طلایی: پیروزی در مدیریت زمان، در انجام همه کارها نیست؛ در تکرار کوچک‌ترین قدم‌ها در هر روز است.
            </p>
          </div>
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
          onClick={() => download()}
          className="cursor-pointer flex-1 rounded-xl bg-day-primary px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
        >
          دانلود
        </button>
      </div>
    </div>
  );
}
