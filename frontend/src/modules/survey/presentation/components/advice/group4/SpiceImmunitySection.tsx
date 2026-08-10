// src/modules/survey/presentation/components/advice/shared/SpiceImmunitySection.tsx

const CATEGORIES = [
  {
    emoji: "🌶️",
    title: "ادویه‌جات",
    subtitle: "تقویت سیستم ایمنی و گوارش",
    instruction: "هر روز یکی را به غذای اصلی یا نوشیدنی اضافه کنید:",
    items: [
      { name: "زردچوبه", benefit: "ضد التهاب قوی" },
      { name: "زنجبیل", benefit: "بهبود هضم" },
      { name: "دارچین", benefit: "تنظیم قند خون" },
      { name: "فلفل قرمز", benefit: "افزایش متابولیسم" },
      { name: "سیر", benefit: "میکروب‌کش طبیعی" },
    ],
  },
  {
    emoji: "🫐",
    title: "میوه و توت‌ها",
    subtitle: "سلامت قلب و پوست",
    instruction: "هر روز یک واحد از این لیست را میل کنید:",
    items: [
      { name: "توت‌ها (بلوبری/شاه‌توت)", benefit: "آنتی‌اکسیدان بالا" },
      { name: "انار", benefit: "جوان‌سازی سلولی" },
      { name: "مرکبات (پرتقال/گریپ‌فروت)", benefit: "ویتامین C" },
      { name: "سیب", benefit: "فیبر و سلامت قلب" },
      { name: "کیوی", benefit: "ویتامین C بالا و سلامت پوست" },
    ],
  },
  {
    emoji: "🥦",
    title: "سبزیجات",
    subtitle: "آنتی‌اکسیدان و فیبر",
    instruction: "حداقل ۲ بار در هفته از این لیست انتخاب کنید (یا بیشتر اگر مایلید):",
    items: [
      { name: "بروکلی", benefit: "سم‌زدایی" },
      { name: "اسفناج", benefit: "آهن و انرژی" },
      { name: "کلم‌پیچ", benefit: "تراکم مواد مغذی" },
      { name: "هویج", benefit: "سلامت بینایی و ایمنی" },
      { name: "فلفل دلمه‌ای", benefit: "منبع ویتامین C" },
    ],
  },
  {
    emoji: "🍫",
    title: "میان‌وعده‌ها",
    subtitle: "تمرکز و انرژی",
    instruction: "یک انتخاب برای زمان‌های خستگی یا میان‌وعده:",
    items: [
      { name: "شکلات تلخ (بالای ۷۰٪)", benefit: "تمرکز و شادی" },
      { name: "چای سبز", benefit: "هوشیاری بدون افت انرژی" },
      { name: "گردو", benefit: "سلامت مغز" },
      { name: "تخمه کدو", benefit: "منیزیم و آرامش" },
      { name: "بادام", benefit: "انرژی پایدار" },
    ],
  },
];

export function SpiceImmunitySection() {
  return (
    <div className="flex flex-col gap-3 p-3 sm:gap-4 sm:p-4" dir="rtl">
      {CATEGORIES.map((cat) => (
        <div
          key={cat.title}
          className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm sm:p-4"
        >
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xl sm:text-2xl">{cat.emoji}</span>
            <div className="min-w-0">
              <span className="text-sm font-bold text-gray-800 sm:text-base">
                {cat.title}
              </span>
              <span className="mr-1 text-xs text-gray-500 sm:text-sm">
                ({cat.subtitle})
              </span>
            </div>
          </div>
          <p className="mb-3 text-xs text-gray-500">{cat.instruction}</p>
          <ul className="flex flex-col gap-1.5 sm:gap-2">
            {cat.items.map((item) => (
              <li key={item.name} className="flex items-start gap-2 text-xs sm:text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-400 sm:mt-2 sm:h-2 sm:w-2" />
                <span className="font-medium text-gray-700">{item.name}</span>
                <span className="text-gray-400">—</span>
                <span className="text-gray-500">{item.benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
