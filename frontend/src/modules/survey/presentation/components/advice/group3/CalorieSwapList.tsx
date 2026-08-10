// src/modules/survey/presentation/components/shared/CalorieSwapList.tsx

const items = [
  { icon: "🥤", title: "نوشیدنی", desc: "به جای نوشابه یا آبمیوه‌های پاکتی، از آب، دتاکس‌واتر یا چای سبز استفاده کنید.", cal: "۱۵۰- کالری" },
  { icon: "🍳", title: "طبخ غذا", desc: "به جای سرخ کردن با روغن زیاد، از روش‌های گریل، بخارپز یا هواپز بهره ببرید.", cal: "۱۰۰ تا ۲۰۰- کالری" },
  { icon: "🧴", title: "سس‌ها", desc: "سس‌های مایونز و چرب را با سس ماست یونانی، سرکه یا بالزامیک جایگزین کنید.", cal: "۱۰۰- کالری" },
  { icon: "🍰", title: "تنقلات", desc: "به جای شیرینی و بیسکویت، از میوه تازه یا یک مشت آجیل خام میل کنید.", cal: "۲۰۰- کالری" },
  { icon: "🍚", title: "کربوهیدرات", desc: "سهم نان سفید و برنج را کم کرده و به جای آن از نان سنگک/جو و سبزیجات استفاده کنید.", cal: "۱۵۰- کالری" },
  { icon: "🚶", title: "پیاده‌روی", desc: "حدود ۳۰ دقیقه پیاده‌روی با سرعت متوسط را به روتین خود اضافه کنید تا مسیر کاهش وزن سریع‌تر شود.", cal: "۱۵۰+ کالری" },
];

export function CalorieSwapList() {
  return (
    <div className="my-6 sm:my-8 space-y-2 sm:space-y-3">
      {items.map((item) => (
        <div
          key={item.title}
          className="flex flex-col sm:flex-row items-start gap-2 sm:gap-3 rounded-xl bg-day-primary/3 p-2.5 sm:p-3 border border-day-primary"
        >
          <div className="flex items-start gap-2 sm:gap-3 w-full">
            <span className="text-xl sm:text-2xl shrink-0">{item.icon}</span>
            <div className="flex-1 text-right">
              <span className="text-xs sm:text-sm font-bold text-day-primary">{item.title}: </span>
              <span className="text-xs sm:text-sm text-gray-600">{item.desc}</span>
            </div>
          </div>
          <span className="self-end sm:self-auto whitespace-nowrap text-[11px] sm:text-xs font-semibold text-green-600 bg-green-100 rounded-full px-2 py-0.5">
            {item.cal}
          </span>
        </div>
      ))}
    </div>
  );
}
