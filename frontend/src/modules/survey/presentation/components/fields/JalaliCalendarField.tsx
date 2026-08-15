// src/design-system/components/JalaliCalendarField.tsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import * as jalaali from 'jalaali-js';

// ─── helpers ────────────────────────────────────────────────────────────────

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

function toFarsi(n: number): string {
  return String(n)
    .split('')
    .map((c) => PERSIAN_DIGITS[parseInt(c)] ?? c)
    .join('');
}

function toFarsiPadded(n: number, len = 2): string {
  return toFarsi(n).padStart(len, '۰');
}

function toGregorianSafe(jy: number, jm: number, jd: number) {
  const r = jalaali.toGregorian(jy, jm, jd);
  return { gy: r.gy!, gm: r.gm!, gd: r.gd! };
}

function toISO(jy: number, jm: number, jd: number): string {
  const { gy, gm, gd } = toGregorianSafe(jy, jm, jd);
  return `${gy}-${String(gm).padStart(2, '0')}-${String(gd).padStart(2, '0')}`;
}

function fromISO(iso: string): { jy: number; jm: number; jd: number } {
  const d = new Date(iso);
  const r = jalaali.toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate());
  return { jy: r.jy, jm: r.jm, jd: r.jd };
}

function todayISO(): string {
  const t = new Date();
  const { jy, jm, jd } = jalaali.toJalaali(
    t.getFullYear(),
    t.getMonth() + 1,
    t.getDate()
  );
  return toISO(jy, jm, jd);
}

function calcFirstDow(jy: number, jm: number): number {
  const { gy, gm, gd } = toGregorianSafe(jy, jm, 1);
  return (new Date(gy, gm - 1, gd).getDay() + 1) % 7;
}

const JALALI_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد',
  'تیر',     'مرداد',    'شهریور',
  'مهر',     'آبان',     'آذر',
  'دی',      'بهمن',     'اسفند',
];

const DOW_LABELS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

const YEAR_MIN = 1300;
const YEAR_MAX = 1405;

// ─── types ───────────────────────────────────────────────────────────────────

type ViewState = 'days' | 'months' | 'years';

interface JalaliCalendarFieldProps {
  value?: string;
  onChange: (iso: string) => void;
  label?: string;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  id?: string;
}

// ─── component ───────────────────────────────────────────────────────────────

export function JalaliCalendarField({
  value = '',
  onChange,
  label,
  placeholder = 'انتخاب تاریخ',
  minDate,
  maxDate,
  disabled = false,
  error,
  required = false,
  id,
}: JalaliCalendarFieldProps) {
  const triggerRef  = useRef<HTMLButtonElement>(null);
  const modalRef    = useRef<HTMLDivElement>(null);
  const yearListRef = useRef<HTMLDivElement>(null);

  const [open, setOpen]       = useState(false);
  const [view, setView]       = useState<ViewState>('days');
  const [tempISO, setTempISO] = useState(value);

  const initNav = useCallback((): { jy: number; jm: number } => {
    if (value) {
      const { jy, jm } = fromISO(value);
      return { jy, jm };
    }
    const t = new Date();
    const { jy, jm } = jalaali.toJalaali(t.getFullYear(), t.getMonth() + 1, t.getDate());
    return { jy, jm };
  }, [value]);

  const [navYear,  setNavYear]  = useState<number>(() => initNav().jy);
  const [navMonth, setNavMonth] = useState<number>(() => initNav().jm);

  // ── selected date breakdown (for blue header display) ────────────────────

  const selectedParts = tempISO ? fromISO(tempISO) : null;

  // ── open / close ──────────────────────────────────────────────────────────

  function openModal() {
    const nav = initNav();
    setNavYear(nav.jy);
    setNavMonth(nav.jm);
    setTempISO(value);
    setView('days');
    setOpen(true);
  }

  function closeModal() { setOpen(false); }

  function confirm() {
    if (tempISO) onChange(tempISO);
    closeModal();
  }

  function selectNow() {
    const iso = todayISO();
    setTempISO(iso);
    const { jy, jm } = fromISO(iso);
    setNavYear(jy);
    setNavMonth(jm);
  }

  // close on outside click
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        closeModal();
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // scroll selected year into view when years panel opens
  useEffect(() => {
    if (view === 'years' && yearListRef.current) {
      const selectedEl = yearListRef.current.querySelector<HTMLElement>('[data-selected="true"]');
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }
  }, [view]);

  // ── navigation ────────────────────────────────────────────────────────────

  function prevMonth() {
    if (navMonth === 1) { setNavYear(y => y - 1); setNavMonth(12); }
    else setNavMonth(m => m - 1);
  }
  function nextMonth() {
    if (navMonth === 12) { setNavYear(y => y + 1); setNavMonth(1); }
    else setNavMonth(m => m + 1);
  }

  // ── helpers ───────────────────────────────────────────────────────────────

  function isDisabledDay(jy: number, jm: number, jd: number): boolean {
    const iso = toISO(jy, jm, jd);
    if (minDate && iso < minDate) return true;
    if (maxDate && iso > maxDate) return true;
    return false;
  }

  function displayValue(): string {
    if (!value) return '';
    const { jy, jm, jd } = fromISO(value);
    return `${toFarsi(jy)}/${toFarsiPadded(jm)}/${toFarsiPadded(jd)}`;
  }

  // ── day grid ──────────────────────────────────────────────────────────────

  function buildDayGrid() {
    const daysInMonth = jalaali.jalaaliMonthLength(navYear, navMonth);
    const firstDow    = calcFirstDow(navYear, navMonth);
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDow; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }

  const today    = todayISO();
  const dayCells = open && view === 'days' ? buildDayGrid() : [];

  // ── year list (scrollable, YEAR_MIN–YEAR_MAX) ─────────────────────────────

  const allYears = Array.from(
    { length: YEAR_MAX - YEAR_MIN + 1 },
    (_, i) => YEAR_MIN + i
  );

  // ── modal position ────────────────────────────────────────────────────────

  function getModalStyle(): React.CSSProperties {
    return {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // render
  // ═══════════════════════════════════════════════════════════════════════════

  const fieldId = id ?? `jcf-${label ?? 'date'}`;

  return (
    <div className="flex flex-col gap-1 w-full" dir="rtl">
      {/* label */}
      {label && (
        <label htmlFor={fieldId} className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
        </label>
      )}

      {/* trigger */}
      <button
        ref={triggerRef}
        id={fieldId}
        type="button"
        disabled={disabled}
        onClick={openModal}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={[
          'flex items-center justify-between w-full px-3 py-2.5 rounded-xl border text-sm',
          'bg-white transition-colors duration-150 focus:outline-none focus:ring-2',
          error
            ? 'border-red-400 focus:ring-red-300'
            : 'border-gray-200 focus:ring-[#0099A8]/30 focus:border-[#0099A8]',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-[#0099A8]/60',
        ].join(' ')}
      >
        <span className={value ? 'text-gray-800' : 'text-gray-400'}>
          {value ? displayValue() : placeholder}
        </span>
        <CalendarIcon className="w-4 h-4 text-gray-400 shrink-0" />
      </button>

      {/* error */}
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}

      {/* portal modal */}
      {open && createPortal(
        <>
          {/* overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-[9998]"
            onClick={closeModal}
            aria-hidden="true"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="انتخاب تاریخ"
            ref={modalRef}
            style={getModalStyle()}
            className="z-[9999] w-80 rounded-2xl shadow-xl overflow-hidden bg-white border border-gray-100"
            dir="rtl"
          >
            {/* ── modal header (blue bar) ── */}
            <div className="bg-[#0099A8] px-4 py-3">

              {/* ── selected date display row ── */}
              <div className="flex items-center justify-between mb-2">
                {/* month selector button */}
                <button
                  type="button"
                  onClick={() => setView(view === 'months' ? 'days' : 'months')}
                  className={[
                    'flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-bold transition-colors cursor-pointer',
                    view === 'months'
                      ? 'bg-white text-[#0099A8] '
                      : 'bg-white/20 text-white hover:bg-white/30 ',
                  ].join(' ')}
                >
                  {selectedParts
                    ? JALALI_MONTHS[selectedParts.jm - 1]
                    : JALALI_MONTHS[navMonth - 1]}
                  <ChevronDownIcon className="w-3 h-3" />
                </button>

                {/* year selector button */}
                <button
                  type="button"
                  onClick={() => setView(view === 'years' ? 'days' : 'years')}
                  className={[
                    'flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-bold transition-colors cursor-pointer',
                    view === 'years'
                      ? 'bg-white text-[#0099A8]'
                      : 'bg-white/20 text-white hover:bg-white/30',
                  ].join(' ')}
                >
                  {selectedParts ? toFarsi(selectedParts.jy) : toFarsi(navYear)}
                  <ChevronDownIcon className="w-3 h-3" />
                </button>
              </div>

              {/* ── nav row (prev / month+year title / next) — only in days view ── */}
              {view === 'days' && (
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={prevMonth}
                    className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10 cursor-pointer"
                    aria-label="ماه قبل"
                  >
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                  <span className="text-white/90 text-sm font-medium">
                    {JALALI_MONTHS[navMonth - 1]} {toFarsi(navYear)}
                  </span>
                  <button
                    type="button"
                    onClick={nextMonth}
                    className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10 cursor-pointer"
                    aria-label="ماه بعد"
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* ── body ── */}
            <div className="p-4">

              {/* ── DAYS VIEW ── */}
              {view === 'days' && (
                <>
                  {/* dow labels */}
                  <div className="grid grid-cols-7 mb-1">
                    {DOW_LABELS.map((l) => (
                      <div key={l} className="text-center text-xs text-gray-400 font-medium py-2">
                        {l}
                      </div>
                    ))}
                  </div>

                  {/* day cells */}
                  <div className="grid grid-cols-7 gap-y-1.5">
                    {dayCells.map((d, i) => {
                      if (d === null) return <div key={`e-${i}`} />;

                      const iso        = toISO(navYear, navMonth, d);
                      const isSelected = iso === tempISO;
                      const isToday    = iso === today;
                      const isDis      = isDisabledDay(navYear, navMonth, d);

                      return (
                        <button
                          key={d}
                          type="button"
                          disabled={isDis}
                          onClick={() => setTempISO(iso)}
                          className={[
                            'h-10 w-full rounded-full text-sm font-medium transition-colors duration-100 cursor-pointer',
                            isDis
                              ? 'text-gray-300 cursor-not-allowed'
                              : isSelected
                              ? 'bg-[#0099A8] text-white'
                              : isToday
                              ? 'border border-[#0099A8] text-[#0099A8]'
                              : 'text-gray-700 hover:bg-day-primary hover:text-white',
                          ].join(' ')}
                        >
                          {toFarsi(d)}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* ── MONTHS VIEW ── */}
            {view === 'months' && (
    <>
      {/* header row: title + close (✕) */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-gray-500">انتخاب ماه</span>
        <button
          type="button"
          onClick={() => setView('days')}
          aria-label="بستن و بازگشت به تقویم"
          className="w-6 h-6 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <CloseIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {JALALI_MONTHS.map((name, i) => {
          const m          = i + 1;
          const isSelected = m === navMonth;
          return (
            <button
              key={m}
              type="button"
              onClick={() => {
                setNavMonth(m);
                if (selectedParts) {
                  const maxD = jalaali.jalaaliMonthLength(navYear, m);
                  const safeD = Math.min(selectedParts.jd, maxD);
                  setTempISO(toISO(navYear, m, safeD));
                }
                setView('days');
              }}
              className={[
                'py-3 rounded-xl text-xs font-medium transition-colors duration-100  hover:cursor-pointer',
                isSelected
                  ? 'bg-[#0099A8] text-white  hover:cursor-pointer'
                  : 'text-gray-700 hover:bg-[#0099A8]/10 hover:cursor-pointer',
              ].join(' ')}
            >
              {name}
            </button>
          );
        })}
      </div>
    </>
  )}

  {/* ── YEARS VIEW (scrollable list) ── */}
  {view === 'years' && (
    <>
      {/* header row: title + close (✕) */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-gray-500">انتخاب سال</span>
        <button
          type="button"
          onClick={() => setView('days')}
          aria-label="بستن و بازگشت به تقویم"
          className="w-6 h-6 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <CloseIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      <div
        ref={yearListRef}
        className="grid grid-cols-3 gap-1.5 overflow-y-auto max-h-52 pr-0.5"
        style={{ scrollbarWidth: 'thin' }}
      >
        {allYears.map((y) => {
          const isSelected = y === navYear;
          return (
            <button
              key={y}
              type="button"
              data-selected={isSelected}
              onClick={() => {
                setNavYear(y);
                if (selectedParts) {
                  const maxD = jalaali.jalaaliMonthLength(y, navMonth);
                  const safeD = Math.min(selectedParts.jd, maxD);
                  setTempISO(toISO(y, navMonth, safeD));
                }
                setView('days');
              }}
              className={[
                'py-3 rounded-xl text-xs font-medium transition-colors duration-100 hover:cursor-pointer',
                isSelected
                  ? 'bg-[#0099A8] text-white'
                  : 'text-gray-700 hover:bg-[#0099A8]/10',
              ].join(' ')}
            >
              {toFarsi(y)}
            </button>
          );
        })}
      </div>
    </>
  )}
</div>

            {/* ── footer ── */}
            <div className="flex items-center justify-between gap-2 px-3 pb-3">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 py-2 rounded-xl border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={selectNow}
                className="flex-1 py-2 rounded-xl border border-[#0099A8]/40 text-xs text-[#0099A8] hover:bg-[#0099A8]/5 transition-colors cursor-pointer"
              >
                اکنون
              </button>
              <button
                type="button"
                onClick={confirm}
                disabled={!tempISO}
                className={[
                  'flex-1 py-2 rounded-xl text-xs text-white font-medium transition-colors cursor-pointer',
                  tempISO
                    ? 'bg-[#0099A8] hover:bg-[#007f8c]'
                    : 'bg-gray-200 cursor-not-allowed',
                ].join(' ')}
              >
                تایید
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}

// ─── micro icons ─────────────────────────────────────────────────────────────

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}


function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="4" width="18" height="18" rx="3" />
      <path d="M3 9h18M8 2v4M16 2v4" strokeLinecap="round" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
