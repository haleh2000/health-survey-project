import React from 'react';
import badIcon from '@survey/presentation/assets/advice/group4/emojis/bad.png';
import sadIcon from '@survey/presentation/assets/advice/group4/emojis/sad.png';
import neutralIcon from '@survey/presentation/assets/advice/group4/emojis/neutral.png';
import goodIcon from '@survey/presentation/assets/advice/group4/emojis/good.png';
import greatIcon from '@survey/presentation/assets/advice/group4/emojis/great.png';

interface WeeklyExerciseTableProps {
  className?: string;
}

const days = [
  { label: 'شنبه', technique: 'مدیتیشن تمرکز' },
  { label: 'یکشنبه', technique: 'تنفس آگاهانه (۴-۷-۸)' },
  { label: 'دوشنبه', technique: 'اسکن بدن' },
  { label: 'سه‌شنبه', technique: 'مدیتیشن تمرکز' },
  { label: 'چهارشنبه', technique: 'تنفس آگاهانه (۴-۷-۸)' },
  { label: 'پنج‌شنبه', technique: 'مدیتیشن مهربانی' },
  { label: 'جمعه', technique: 'انتخاب آزاد' },
];

const emotionIcons = [
  { src: badIcon, alt: 'خیلی بد' },
  { src: sadIcon, alt: 'بد' },
  { src: neutralIcon, alt: 'متوسط' },
  { src: goodIcon, alt: 'خوب' },
  { src: greatIcon, alt: 'عالی' },
];

const LegendIcons = () => (
  <div className="flex justify-center gap-2">
    {emotionIcons.map((icon, i) => (
      <img key={i} src={icon.src} alt={icon.alt} title={icon.alt}
        className="h-5 w-5 object-contain" />
    ))}
  </div>
);

const CheckBoxes = ({ prefix, row }: { prefix: string; row: number }) => (
  <div className="flex justify-center gap-1">
    {emotionIcons.map((_, i) => (
      <div key={`${prefix}-${row}-${i}`}
        className="h-6 w-6 border-2 border-day-primary rounded bg-white shrink-0" />
    ))}
  </div>
);

const WeeklyExerciseTable: React.FC<WeeklyExerciseTableProps> = ({ className = '' }) => (
  <div className={`w-full ${className}`} dir="rtl">
    {/* Desktop: normal table | Mobile: scrollable */}
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300 bg-white text-sm min-w-[480px]">
        <thead>
          <tr className="bg-[#acdee2]/50">
            {['روز', 'تکنیک', 'احساس قبل', 'احساس بعد'].map(h => (
              <th key={h} className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-700 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
          <tr>
            <td className="border border-gray-300 p-1" />
            <td className="border border-gray-300 p-1" />
            <td className="border border-gray-300 px-2 py-1"><LegendIcons /></td>
            <td className="border border-gray-300 px-2 py-1"><LegendIcons /></td>
          </tr>
        </thead>
        <tbody>
          {days.map((day, i) => (
            <tr key={i}>
              <td className="border border-gray-300 px-3 py-2 text-center font-medium text-gray-800 whitespace-nowrap">
                {day.label}
              </td>
              <td className="border border-gray-300 px-3 py-2 text-center text-gray-700">
                {day.technique}
              </td>
              <td className="border border-gray-300 px-2 py-2">
                <CheckBoxes prefix="b" row={i} />
              </td>
              <td className="border border-gray-300 px-2 py-2">
                <CheckBoxes prefix="a" row={i} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="mt-4 bg-gray-50 rounded-lg p-3 border border-gray-200">
      <h3 className="text-xs font-semibold text-gray-700 mb-2">راهنمای تکنیک‌ها:</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-xs text-gray-600">
        <div>• مدیتیشن تمرکز: تمرکز روی نفس یا یک نقطه ثابت</div>
        <div>• تنفس آگاهانه (۴-۷-۸): دم ۴ ثانیه، نگه دارید ۷، بازدم ۸</div>
        <div>• اسکن بدن: توجه به احساسات هر قسمت از بدن</div>
        <div>• مدیتیشن مهربانی: تمرین احساس مهربانی به خود و دیگران</div>
        <div>• انتخاب آزاد: هر تکنیک دلخواه شما</div>
      </div>
    </div>
  </div>
);

export default WeeklyExerciseTable;
