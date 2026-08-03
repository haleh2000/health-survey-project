// src/modules/survey/presentation/components/advice/group4/sections/WeeklyGratitudePlanner.tsx
import React from 'react';

const DAYS = ['شنبه','یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه'];

const FIELDS = [
  'بهترین اتفاق امروز:',
  'چیزی که امروز یاد گرفتم:',
  'چیزی که باعث رشد لبخند بزنم:',
  'کاری که برای فردا برایم معنادار است:',
];

const WeeklyGratitudePlanner: React.FC = () => (
  <div className="space-y-6 print:space-y-4">
    {DAYS.map((day) => (
      <div key={day} className="border-2 border-gray-300 rounded-lg p-4 print:break-inside-avoid">
        <p className="font-bold text-lg text-day-primary mb-3 text-center">{day}</p>
        <div className="space-y-3">
          {FIELDS.map((field) => (
            <div key={field} className="flex flex-col gap-1">
              <p className="text-sm text-gray-700 font-medium">{field}</p>
              <div className="border-b-2 border-dotted border-gray-400 h-4 mb-4" />
            </div>
          ))}
        </div>
      </div>
    ))}

    <div className="mt-6 p-4 bg-day-red/10 border border-day-red rounded-lg print:hidden">
      <p className="text-sm text-gray-700 leading-relaxed">
        💡 <strong>راهنما:</strong> هر شب قبل از خواب، چند دقیقه برای تکمیل این بخش وقت بگذارید.
        ثبت خاطرات مثبت و یادگیری‌های روزانه به تقویت حس سپاسگزاری و آگاهی از پیشرفت‌های شخصی کمک می‌کند.
      </p>
    </div>
  </div>
);

export default WeeklyGratitudePlanner;
