import { AdviceSectionCard } from "../shared/AdviceSectionCard";
import { WeeklyDayTracker } from "../shared/WeeklyDayTracker";
import { MediterraneanPlateSection } from "../shared/MediterraneanPlateSection";

import nutritionImg from "@survey/presentation/assets/advice/group1/nutrition-character.png";

export function NutritionSection() {
  return (
    <AdviceSectionCard
      borderTitle="پیشنهادات تغذیه"
      title="پیشنهادات تغذیه"
      imageSrc={nutritionImg}
      imageAlt="شخصیت تغذیه"
    >
      <div className="space-y-6">
        <MediterraneanPlateSection />

        <div className="mt-6">
          <img src={nutritionImg} alt="شخصیت تغذیه" className="object-contain" />
        </div>

        {/* توضیح چگونگی حذف */}
        <div className="space-y-3 rounded-xl bg-rose-50 p-4">
          <h3 className="text-md font-bold text-day-red">❌ چک لیست حذف:</h3>
          <h4 className="text-sm font-bold text-day-red">🧂نمک‌سنج روزانه</h4>
          <p className="text-sm leading-5 text-gray-400">
            نمکی که بهتر است روزانه مصرف کنید معمولاً کمتر از ۵ گرم نمک در روز توصیه می‌شود؛ حدود یک قاشق چای‌خوری.
          </p>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-400">منابع پنهان نمک</p>
            <ul className="mr-4 space-y-1 text-sm text-gray-500">
              <li>• نان سنگک (۱g)🔄 نان بدون نمک</li>
              <li>• پنیر لیقوان (۲g) 🔄 پنیر کم‌نمک</li>
              <li>• ترشی/شور (۳g)  🔄 سالاد یا سبزی خوردن</li>
              <li>• سس آماده (۲g)🔄 سس دست‌ساز یا رب‌گوجه تازه بدون نمک</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200">
          <h4 className="text-sm font-bold text-gray-700 mb-3 text-right">
            جایگزین‌های طعم‌دهنده به‌جای نمک
          </h4>
          <div className="flex justify-center gap-2 mb-2">
            {[
              { icon: '🍋', label: 'آبلیمو تازه' },
              { icon: '🧴', label: 'سرکه' },
              { icon: '🫚', label: 'زنجبیل' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 bg-gray-50 rounded-full px-3 py-1.5 border border-gray-200"
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-xs text-gray-600 whitespace-nowrap">{item.label}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-2">
            {[
              { icon: '🧄', label: 'سیر و پیاز' },
              { icon: '⚫', label: 'فلفل سیاه' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 bg-gray-50 rounded-full px-3 py-1.5 border border-gray-200"
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-xs text-gray-600 whitespace-nowrap">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-day-red flex items-center gap-1.5">
            ⚠️ مصرف موارد زیر را به حداقل برسانید
          </p>
          <div className="grid grid-cols-1 gap-1.5">
            {[
              { icon: "🚬", label: "سیگار" },
              { icon: "🍺", label: "الکل" },
              { icon: "🍔", label: "فست فود (برگر، پیتزا و ...)" },
              { icon: "🌭", label: "گوشت‌های فرآوری‌شده (کالباس، سوسیس)" },
              { icon: "🌡️", label: "نوشیدنی‌های بسیار داغ (بالاتر از ۶۵ درجه)" },
              { icon: "🌫️", label: "غذاهای دودی (کباب، ماهی دودی، برنج دودی)" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 border border-red-100"
              >
                <span className="text-base">❌</span>
                <span className="text-base">{item.icon}</span>
                <span className="text-sm text-gray-600">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-red-100 bg-gradient-to-br from-red-50 to-orange-50 p-4">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-red-600">
            🚫 حذف عادت‌های ناسالم
          </h3>
          <p className="text-right text-xs leading-relaxed text-gray-500">
            عادت‌هایی وجود دارد که بهتر است در سبک زندگی روزانه حذف یا تا حد ممکن محدود شوند. این لیست کمک می‌کند تا آگاهانه‌تر انتخاب کنیم و به مرور زمان عادت‌های سالم‌تر را جایگزین رفتارهای نامناسب کنیم.
          </p>
        </div>

        <WeeklyDayTracker label="نمک‌سنج روزانه" />
        <WeeklyDayTracker label="حذف عادت‌های ناسالم" />
      </div>
    </AdviceSectionCard>
  );
}
