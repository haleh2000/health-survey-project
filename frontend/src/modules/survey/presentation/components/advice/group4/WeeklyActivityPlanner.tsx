interface ExerciseGoal {
  category: string;
  items: string[];
}

const GOALS: ExerciseGoal[] = [
  {
    category: "استقامت",
    items: ["دو ۵ کیلومتر در زمان زیر ۳۰ دقیقه"],
  },
  {
    category: "قدرت",
    items: [
      "انجام ۵۰ شنای سوئدی متوالی",
      "اجرای ۵ بار بارفیکس کامل با فرم صحیح",
    ],
  },
  {
    category: "کوهنوردی و طبیعت",
    items: [
      "صعود به قله [نام قله] تا پایان فصل",
      "پیمایش کامل مسیر [نام مسیر/جنگل] در یک روز",
    ],
  },
  {
    category: "سلامت و ترکیب بدنی",
    items: [
      "کاهش ۵ کیلوگرم وزن با حفظ عضله",
      "رسیدن به وزن [عدد هدف] برای بهبود وضعیت جسمانی",
    ],
  },
];

const DAYS = [
  { label: "شنبه", type: "هوازی" },
  { label: "یکشنبه", type: "قدرتی" },
  { label: "دوشنبه", type: "هوازی" },
  { label: "سه‌شنبه", type: "قدرتی" },
  { label: "چهارشنبه", type: "هوازی" },
  { label: "پنج‌شنبه", type: "یوگا/کششی" },
  { label: "جمعه", type: "استراحت فعال" },
];

export function WeeklyActivityPlanner() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-6 rounded-2xl bg-day-primary/5 p-4 mt-5">
        {DAYS.map(({ label, type }) => (
          <div key={label} className="flex items-center gap-2 text-sm flex-wrap sm:flex-nowrap">
            <span className="whitespace-nowrap text-gray-500">
              {label} ({type}):
            </span>
            <div className="flex-1 min-w-[40px] border-b-2 border-dotted border-gray-400" />
            <span className="whitespace-nowrap text-gray-500">مدت:</span>
            <div className="w-16 sm:w-20 border-b-2 border-dotted border-gray-400" />
            <span className="text-gray-500">دقیقه</span>
          </div>
        ))}
        <div className="flex items-center gap-2 text-sm flex-wrap sm:flex-nowrap">
          <span className="whitespace-nowrap text-day-primary">تعداد روزهای انجام‌شده:</span>
          <div className="w-16 border-b-2 border-dotted border-gray-400" />
          <span className="whitespace-nowrap text-day-primary">از ۷ روز — مجموع:</span>
          <div className="w-16 sm:w-20 border-b-2 border-dotted border-gray-400" />
          <span className="text-day-primary">دقیقه</span>
        </div>
      </div>
    </div>
  );
}
