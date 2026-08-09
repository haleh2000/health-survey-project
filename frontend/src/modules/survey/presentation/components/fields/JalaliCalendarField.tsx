import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toJalaali, toGregorian, jalaaliMonthLength } from 'jalaali-js';

const JALALI_MONTHS = [
  'فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور',
  'مهر','آبان','آذر','دی','بهمن','اسفند'
];
const WEEK_DAYS = ['ش','ی','د','س','چ','پ','ج'];
const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

function toFarsi(n: number): string {
  return String(n).replace(/\d/g, d => FA_DIGITS[+d] ?? d);
}

function toFarsiPadded(n: number): string {
  return String(n).padStart(2, '0').replace(/\d/g, d => FA_DIGITS[+d] ?? d);
}

function getTodayJalali() {
  const now = new Date();
  return toJalaali(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

function parseValue(value: string) {
  const match = /^(\d{4})[-/](\d{2})[-/](\d{2})$/.exec(value);
  if (!match) return { jy: 0, jm: 0, jd: 0 };
  return { jy: Number(match[1]), jm: Number(match[2]), jd: Number(match[3]) };
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export function JalaliCalendarField({ value, onChange, label }: Props) {
  const today = getTodayJalali();
  const parsed = parseValue(value);
  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const [viewYear, setViewYear] = useState(parsed.jy || today.jy);
  const [viewMonth, setViewMonth] = useState((parsed.jm || today.jm) - 1);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const endYear = today.jy + 10;
  const years = Array.from({ length: endYear - 1300 + 1 }, (_, i) => 1300 + i);

  function handleOpen() {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setOpenUp(rect.bottom + 300 > window.innerHeight);
    }
    setOpen(o => !o);
  }

  function changeMonth(delta: number) {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setViewMonth(m);
    setViewYear(y);
  }

  const jm = viewMonth + 1;
  const daysInMonth = jalaaliMonthLength(viewYear, jm);
  const { gy, gm, gd } = toGregorian(viewYear, jm, 1);
  const firstDow = (new Date(gy, gm - 1, gd).getDay() + 1) % 7;

  const displayValue = parsed.jy
    ? `${toFarsi(parsed.jy)}/${toFarsiPadded(parsed.jm)}/${toFarsiPadded(parsed.jd)}`
    : 'انتخاب تاریخ';

  return (
    <div ref={containerRef} className="relative inline-block" dir="rtl">
      {label && <label className="block text-sm mb-1">{label}</label>}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleOpen}
        className="border rounded-control text-gray-500 px-3 py-2 min-w-[160px] text-right bg-white hover:border-[#003a40a8] focus:border-[#003a40a8] whitespace-nowrap"
      >
        {displayValue}
      </button>

      <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: openUp ? 6 : -6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: openUp ? 4 : -4 }}
          transition={{ type: 'spring', stiffness: 420, damping: 30 }}
          style={{ transformOrigin: openUp ? 'bottom right' : 'top right' }}
          className={`absolute z-50 ${openUp ? 'bottom-full mb-1' : 'mt-1'} bg-white border rounded-xl shadow-xl p-3 w-72`}>
          <div className="flex items-center justify-between mb-2 gap-1">
            <button type="button" onClick={() => changeMonth(1)} className="cursor-pointer text-gray-400 px-2 py-1 hover:bg-gray-100 rounded">‹</button>

            <div className="flex items-center gap-1">
              <span className="text-gray-500 font-medium">{JALALI_MONTHS[viewMonth]}</span>
              <div className="relative inline-flex items-center">
                <select
                  value={viewYear}
                  onChange={e => setViewYear(Number(e.target.value))}
                  className="appearance-none text-gray-500 border rounded pl-1 pr-4 py-0.5 text-sm focus-visible:outline-none"
                >
                  {years.map(y => (
                    <option key={y} value={y}>{toFarsi(y)}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute left-0.5 text-[10px] text-gray-400">▾</span>
              </div>
            </div>

            <button type="button" onClick={() => changeMonth(-1)} className="cursor-pointer text-gray-400 px-2 py-1 hover:bg-gray-100 rounded">›</button>
          </div>

          <div className="grid grid-cols-7 text-center text-xs text-gray-500 mb-1">
            {WEEK_DAYS.map(d => <div key={d}>{d}</div>)}
          </div>

          <div className="grid grid-cols-7 text-center text-sm">
            {Array.from({ length: firstDow }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const isSelected = parsed.jy === viewYear && parsed.jm === jm && parsed.jd === day;
              const isToday = today.jy === viewYear && today.jm === jm && today.jd === day;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => {
                    onChange(`${viewYear}-${String(jm).padStart(2,'0')}-${String(day).padStart(2,'0')}`);
                    setOpen(false);
                  }}
                  className={`cursor-pointer text-gray-500 rounded py-1 hover:text-white hover:bg-day-primary ${isSelected ? 'bg-day-primary text-white hover:bg-blue-600' : ''} ${isToday && !isSelected ? 'font-bold text-day-red' : ''}`}
                >
                  {toFarsi(day)}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
