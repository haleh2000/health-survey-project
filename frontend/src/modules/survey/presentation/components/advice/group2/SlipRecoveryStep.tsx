interface SlipRecoveryStep {
  question: string;
  options: string;
}

const RECOVERY_QUESTIONS: SlipRecoveryStep[] = [
  {
    question: 'چه اتفاقی افتاد؟',
    options: 'تغذیه خارج از برنامه / ورزش انجام نشد / آب کافی نخوردم و ...',
  },
  {
    question: 'چرا این اتفاق افتاد؟',
    options: 'فراموش کردم / خستگی / استرس / مهمانی / سفر / بیرون بودن / بی‌برنامگی',
  },
  {
    question: 'همین حالا یک قدم کوچک',
    options: 'یک لیوان آب / ۱۰ دقیقه پیاده‌روی / یک وعده سالم / ۵ دقیقه حرکت سبک / ثبت در پلنر برنامه فردا',
  },
  {
    question: 'برنامه فردا',
    options: 'فردا این کار را حتماً انجام می‌دهم:',
  },
];

export const SlipRecoveryGuide: React.FC = () => {
  return (
    <div className="w-full bg-white rounded-xl p-6 space-y-5">
      <h3 className="text-lg font-bold text-gray-800 text-right">
        اگر دچار لغزش شدید برای بازگشت این سوالات را از خود بپرسید:
      </h3>

      <div className="space-y-4">
        {RECOVERY_QUESTIONS.map((item, idx) => (
          <div key={idx} className="border-r-4 border-teal-500 pr-4 py-1">
            <p className="font-semibold text-teal-700 text-right mb-1">
              {item.question}
            </p>
            <p className="text-gray-600 text-sm text-right">
              {item.options}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3 mt-4">
        <span className="text-xl">✨</span>
        <p className="text-sm text-amber-800 text-right leading-relaxed">
          <span className="font-bold">نکته طلایی:</span> کیفیت مسیر شما را «سرعت بازگشت» تعیین می‌کند، نه «تعداد لغزش‌ها».
        </p>
      </div>
    </div>
  );
};
