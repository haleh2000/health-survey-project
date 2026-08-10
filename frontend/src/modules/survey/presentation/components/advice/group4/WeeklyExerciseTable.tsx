// src/modules/survey/presentation/components/advice/group4/WeeklyExerciseTable.tsx
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
  <div className="flex justify-center gap-0.5 sm:gap-2">
    {emotionIcons.map((icon, i) => (
      <img
        key={i}
        src={icon.src}
        alt={icon.alt}
        title={icon.alt}
        className="h-3.5 w-3.5 shrink-0 object-contain sm:h-5 sm:w-5"
      />
    ))}
  </div>
);

const CheckBoxes = ({ prefix, row }: { prefix: string; row: number }) => (
  <div className="flex justify-center gap-0.5 sm:gap-1">
    {emotionIcons.map((_, i) => (
      <div
        key={`${prefix}-${row}-${i}`}
        className="h-3.5 w-3.5 shrink-0 rounded border border-day-primary bg-white sm:h-6 sm:w-6 sm:border-2"
      />
    ))}
  </div>
);

const WeeklyExerciseTable: React.FC<WeeklyExerciseTableProps> = ({ className = '' }) => (
  <div className={`${className}`} dir="rtl">
    <table className="w-full table-fixed border-collapse border border-gray-300 bg-white text-[9.5px] leading-tight sm:text-sm">
      <thead>
        <tr className="bg-[#acdee2]/50">
          <th className="w-[15%] border border-gray-300 px-1 py-1 text-center font-semibold text-gray-700 sm:w-auto sm:px-3 sm:py-2">
            روز
          </th>
          <th className="w-[25%] border border-gray-300 px-1 py-1 text-center font-semibold text-gray-700 sm:w-auto sm:px-3 sm:py-2">
            تکنیک
          </th>
          <th className="w-[30%] border border-gray-300 px-1 py-1 text-center font-semibold text-gray-700 sm:w-auto sm:px-3 sm:py-2">
            احساس قبل
          </th>
          <th className="w-[30%] border border-gray-300 px-1 py-1 text-center font-semibold text-gray-700 sm:w-auto sm:px-3 sm:py-2">
            احساس بعد
          </th>
        </tr>
        <tr>
          <td className="border border-gray-300 p-0" />
          <td className="border border-gray-300 p-0" />
          <td className="border border-gray-300 px-1 py-1 sm:px-2 sm:py-1">
            <LegendIcons />
          </td>
          <td className="border border-gray-300 px-1 py-1 sm:px-2 sm:py-1">
            <LegendIcons />
          </td>
        </tr>
      </thead>
      <tbody>
        {days.map((day, i) => (
          <tr key={i}>
            <td className="border border-gray-300 px-1 py-1 text-center font-medium text-gray-800 sm:px-3 sm:py-2">
              {day.label}
            </td>
            <td className="border border-gray-300 px-1 py-1 text-center text-gray-700 sm:px-3 sm:py-2">
              <span className="block break-words">{day.technique}</span>
            </td>
            <td className="border border-gray-300 px-1 py-1 sm:px-2 sm:py-2">
              <CheckBoxes prefix="b" row={i} />
            </td>
            <td className="border border-gray-300 px-1 py-1 sm:px-2 sm:py-2">
              <CheckBoxes prefix="a" row={i} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
      <h3 className="mb-2 text-xs font-semibold text-gray-700 sm:text-sm">
        راهنمای تکنیک‌ها:
      </h3>
      <div className="grid grid-cols-1 gap-1 text-[10px] leading-relaxed text-gray-600 sm:grid-cols-2 sm:text-xs">
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
