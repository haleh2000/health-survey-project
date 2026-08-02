
import { useState } from "react";

const DAYS = ["شنبه", "یک‌شنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];

export function DailyNoteField() {
  const [notes, setNotes] = useState<Record<string, string>>({});

  return (
    <div className="space-y-2">
      <div className="flex">
            <ul className="space-y-1 text-sm text-gray-700">
              <li className="flex items-center gap-2"><span className="text-2xl">✍️</span><span className="text-day-red text-lg font-bold">شکرگزاری شبانه</span></li>
              <li className="flex items-center gap-2"><span>این تمرین مغز را از چرخه «نشخوار فکری» خارج کرده و با استفاده از قانون «پایانِ خوش»، شما روز خود را با یادآوری اتفاقات خوب به پایان می‌رسانید؛ این کار باعث می‌شود خاطره‌ی کلِ روز در ذهن شما مثبت‌تر ثبت شود.</span></li>
              </ul>
        </div>
        
      <p className="text-base py-4 text-gray-600">۳ چیز خوبی که امروز اتفاق افتاد:</p>
      <div className="grid grid-cols-2 gap-8">
        {DAYS.map((day) => (
          <div key={day} className="bg-white rounded-2xl p-6 border-2 border-day-primary relative">
            <label className="absolute -top-2 right-3 bg-white px-1 text-sm font-semibold text-gray-500">
              {day}
            </label>
            <div className="space-y-8 pt-1">
              <div className="border-b border-gray-300" />
              <div className="border-b border-gray-300" />
              <div className="border-b border-gray-300" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
