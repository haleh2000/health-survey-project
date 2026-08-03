// src/modules/survey/presentation/components/advice/sections/PhysicalActivitySection.tsx

const GOALS = [
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
      "رسیدن به وزن [عدد هدف] برای بهبود وضعیت جسمانی در بازه زمانی صحیح",
    ],
  },
];

export function PhysicalActivitySection() {
  return (
    <div className="flex flex-col gap-6 py-6">
         <div className="flex flex-col gap-3">
        <p className="text-sm font-bold text-gray-700">
          مثال‌هایی برای اهداف اصلی:
        </p>
        {GOALS.map((group) => (
          <div
            key={group.category}
            className="rounded-xl bg-white p-3 shadow-sm"
          >
            <p className="mb-2 text-sm font-bold text-gray-700">
              {group.category}
            </p>
            <ul className="flex flex-col gap-1 pr-4">
              {group.items.map((item) => (
                <li
                  key={item}
                  className="list-disc text-sm leading-relaxed text-ink-subtle"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-8">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-700">
              هدف انتخاب‌شده:
            </span>
            <div className="flex-1 border-b-2 border-dotted border-gray-400" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-700">
                تاریخ شروع:
              </span>
              <div className="flex-1 border-b-2 border-dotted border-gray-400" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-700">
                تاریخ پایان:
              </span>
              <div className="flex-1 border-b-2 border-dotted border-gray-400" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-700">
              رکوردهای من:
            </span>
            <div className="flex-1 border-b-2 border-dotted border-gray-400" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-700">رکورد فعلی:</span>
            <div className="flex-1 border-b-2 border-dotted border-gray-400" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-700">رکورد هدف:</span>
            <div className="flex-1 border-b-2 border-dotted border-gray-400" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-day-primary">
              میزان پیشرفت هفتگی:
            </span>
            <div className="flex-1 border-b-2 border-dotted border-day-primary" />
          </div>
        </div>
      </div>

    </div>
  );
}
