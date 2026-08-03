// src/modules/survey/presentation/components/advice/group4/sections/MindfulnessMeditationSection.tsx

const MEDITATIONS = [
  {
    title: "تنفس آگاهانه (۴-۷-۸)",
    steps: [
      "از بینی ۴ ثانیه دم بگیرید.",
      "نفس را ۷ ثانیه در سینه حبس کنید.",
      "با صدایی ضعیف (شبیه فوت) در ۸ ثانیه نفس را از دهان خالی کنید.",
      "این چرخه را ۴ بار تکرار کنید.",
    ],
  },
  {
    title: "اسکن بدن",
    steps: [
      "به پشت دراز بکشید یا راحت بنشینید.",
      "از انگشتان پا تمرکز را شروع کنید و خیلی آرام، نقطه به نقطه تا بالای سر حرکت دهید.",
      "در هر بخش، فقط احساس همان نقطه (گرما، سرما، گرفتگی یا سنگینی) را بدون قضاوت مشاهده کنید و به بخش بعدی بروید.",
    ],
  },
  {
    title: "مدیتیشن تمرکز",
    steps: [
      "یک نقطه ثابت انتخاب کنید (مثلا ورود و خروج هوا از بینی یا بالا و پایین رفتن شکم).",
      "تمام توجهتان را فقط روی آن نقطه بگذارید.",
      "",
    ],
  },
  {
    title: "مدیتیشن مهربانی",
    steps: [
      "در سکوت چشمانتان را ببندید.",
      "این جمله را در ذهن برای خودتان تکرار کنید: «امیدوارم در آرامش باشی.»",
      "سپس همین حس خیرخواهی را در ذهنتان به ترتیب به سمت یک فرد عزیز، یک فرد غریبه و در نهایت کسی که با او چالش دارید، هدایت کنید.",
    ],
  },
];

export function MindfulnessMeditationSection() {
  return (
    <div className="my-8 flex flex-col gap-4">
        <h3 className="text-gray-500">انجام هر کدام از مدیتیشن ها به صورت زیر است:</h3>
      {MEDITATIONS.map((med) => (
        <div
          key={med.title}
          className="rounded-2xl bg-white p-4 shadow-sm"
        >
          <p className="mb-2 font-bold text-gray-500">{med.title}</p>
          <ol className="flex flex-col gap-1 pr-4">
            {med.steps.map((step, i) => (
              <li key={i} className="text-sm leading-relaxed text-ink-subtle list-decimal">
                {step}
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}
