import { SectionHeader } from "./SectionHeader";
import { WeeklyDayTracker } from "./WeeklyDayTracker";

export function MediterraneanPlateSection() {
  return (
    <div className="space-y-4">
      <div className="flex">
        <SectionHeader
          emoji="🍽️"
          title="بشقاب مدیترانه‌ای"
          titleColorClass="text-day-red"
          description="مدیترانه‌ای یک الگوی غذایی سنتی، سالم و متوازن متعلق به کشورهای حاشیه دریای مدیترانه است که به جای حذف گروه‌های غذایی یا شمارش کالری، بر کیفیت غذا و مصرف چربی‌های سالم تمرکز دارد."
        />
      </div>

      <div className="flex items-start gap-3 rounded-lg bg-green-50 p-4">
        <div className="flex-1">
          <h4 className="mb-2 font-bold text-green-700">
            بشقاب ایده‌آل یک وعده من:
          </h4>
          <ul className="space-y-1 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <span className="text-lg text-green-600">🥗</span>
              <span>نیمی سبزیجات: مثلا سالاد، خیار، گوجه، سبزی خوردن، کاهو</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-lg text-blue-600">🐟</span>
              <span>یک‌چهارم پروتئین: گوشت قرمز، مرغ یا ماهی</span>
            </li>
            <li className="flex items-center gap-2">
              <span></span>
              <span>یا ۶ عدد گردو (جایگزین ماهی برای امگا۳)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-lg text-amber-600">🌾</span>
              <span>یک‌چهارم غلات کامل: برنج قهوه‌ای / نان سبوس‌دار</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-lg text-green-600">🫒</span>
              <span>روغن زیتون: فشنگی غذاخوری به جای کره/دنبه</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="relative" dir="rtl">
        <WeeklyDayTracker label="بشقاب ایده‌آل" />
      </div>
    </div>
  );
}
