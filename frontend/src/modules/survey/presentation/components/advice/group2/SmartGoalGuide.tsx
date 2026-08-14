// SmartGoalGuide.tsx
import React from "react";

interface SmartCriterion {
  emoji: string;
  title: string;
  description: string;
}

const SMART_CRITERIA: SmartCriterion[] = [
  {
    emoji: "🎯",
    title: "مشخص (Specific)",
    description: "تعریف دقیقِ کار به‌جای کلی‌گویی (چه چیزی؟)",
  },
  {
    emoji: "📏",
    title: "قابل اندازه‌گیری (Measurable)",
    description: "تعیین متر و معیار عددی برای سنجش پیشرفت (چقدر؟)",
  },
  {
    emoji: "✅",
    title: "دست‌یافتنی (Achievable)",
    description: "انتخاب هدفی واقع‌بینانه و در حد توان فعلی (آیا شدنی است؟)",
  },
  {
    emoji: "💡",
    title: "مرتبط (Relevant)",
    description: "همسویی هدف با اولویت‌ها و بهبود سلامتی شما (چرا این هدف؟)",
  },
  {
    emoji: "🗓️",
    title: "زمان‌دار (Time-bound)",
    description: "مشخص کردن تاریخ دقیق شروع و پایان کار (تا چه زمانی؟)",
  },
];

const SmartGoalGuide: React.FC = () => {
  return (
    <div className="space-y-6 my-8 bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
      <div>
        <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3">
          🎯 روش SMART برای تنظیم هدف سلامتی
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 mb-4">
          هدف باید ویژگی‌های زیر را داشته باشد:
        </p>
      </div>

      <div className="space-y-3">
        {SMART_CRITERIA.map(({ emoji, title, description }) => (
          <div key={title} className="flex items-start gap-2 sm:gap-3">
            <span className="text-md sm:text-xl shrink-0">{emoji}</span>
            <div>
              <h4 className="font-bold text-gray-800 text-xs sm:text-sm">{title}</h4>
              <p className="text-xs sm:text-sm text-gray-600">{description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-day-primary/5 rounded-lg border-r-4 border-day-primary">
        <h4 className="font-bold text-gray-800 mb-2 text-xs sm:text-sm">
          💬 مثال استفاده از روش SMART در تنظیم هدف سلامتی:
        </h4>
        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
          به‌جای «می‌خواهم لاغر شوم»، می‌گوییم:
          <br />
          <span className="font-medium">
            «تا ۳۰ روز آینده (T)، ۴ کیلوگرم کاهش وزن (M) از طریق ۳ جلسه ورزش در
            هفته (S) خواهم داشت تا به تناسب اندام برسم (R). این هدف با توجه به
            وزن فعلی من کاملاً ممکن است (A).»
          </span>
        </p>
      </div>
    </div>
  );
};

export default SmartGoalGuide;
