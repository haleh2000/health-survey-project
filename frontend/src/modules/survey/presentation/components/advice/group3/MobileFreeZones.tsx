// src/modules/advice/components/MobileFreeZones.tsx
import { toPersianDigits } from "@core/utils/numbers";

const ZONES = [
  { time: 'صبح', desc: '۳۰ دقیقه اول بیداری', emoji: '🌅' },
  { time: 'غذا', desc: 'هنگام صرف وعده غذایی', emoji: '🍽️' },
  { time: 'کار عمیق', desc: 'حین تمرکز و جلسات', emoji: '💼' },
  { time: 'گفتگو', desc: 'هنگام صحبت با دیگران', emoji: '👥' },
  { time: 'شب', desc: '۳۰ دقیقه قبل از خواب', emoji: '🌙' },
];

export function MobileFreeZones() {
  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">📵</span>
        <h3 className="text-lg sm:text-xl font-bold text-gray-800">
          تمرین ۵ نقطه کنترلی
        </h3>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-start gap-2 text-sm sm:text-base text-gray-700">
          <span className="text-lg">🎯</span>
          <p>
            <strong>هدف:</strong> مدیریت زمان و حضور در لحظه
          </p>
        </div>
        <div className="flex items-start gap-2 text-sm sm:text-base text-gray-700">
          <span className="text-lg">💡</span>
          <p>
            <strong>حد مورد قبول:</strong> رعایت {toPersianDigits(3)} مورد از {toPersianDigits(5)} مورد = روز باکیفیت
          </p>
        </div>
      </div>

      <div className="mb-2">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">📍</span>
          <p className="text-sm sm:text-base font-semibold text-gray-800">
            زمان‌های بدون موبایل:
          </p>
        </div>

        <div className="space-y-2">
          {ZONES.map((zone, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200"
            >
              <span className="text-xl">{zone.emoji}</span>
              <span className="text-sm sm:text-base font-semibold text-gray-800 min-w-[70px]">
                {zone.time}
              </span>
              <span className="text-gray-400">|</span>
              <span className="text-sm sm:text-base text-gray-600 flex-1">
                {zone.desc}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
