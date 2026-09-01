import { useEffect, useRef, useState } from 'react'
import moment from 'moment-jalaali'
import { toEnglishDigits } from '../utils/digits'

type JalaliDatePickerProps = {
  value: string
  onChange: (gregorianValue: string) => void
  placeholder?: string
}

const JALALI_MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
]

const JALALI_WEEKDAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']

function parseValue(value: string) {
  const parsed = value ? moment(toEnglishDigits(value), 'YYYY-M-D') : moment()
  return parsed.isValid() ? parsed : moment()
}

function toJalaliDisplay(value: string) {
  if (!value) return ''
  const parsed = parseValue(value)
  return parsed.format('jYYYY/jMM/jDD')
}

export function JalaliDatePicker({
  value,
  onChange,
  placeholder = '',
}: JalaliDatePickerProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [viewMoment, setViewMoment] = useState(() =>
    parseValue(value).clone().startOf('jMonth'),
  )

  // useEffect removed - initial value is set in useState initializer above

  useEffect(() => {
    function handleDocumentPointerDown(event: PointerEvent) {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    function handleDocumentKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('pointerdown', handleDocumentPointerDown)
    document.addEventListener('keydown', handleDocumentKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handleDocumentPointerDown)
      document.removeEventListener('keydown', handleDocumentKeyDown)
    }
  }, [])

  const selectedMoment = parseValue(value)
  const todayMoment = moment()

  const firstDayOfMonth = viewMoment.clone().startOf('jMonth')
  const daysInMonth = moment.jDaysInMonth(
    viewMoment.jYear(),
    viewMoment.jMonth(),
  )
  const leadingBlanks = (firstDayOfMonth.day() + 1) % 7

  const dayCells: Array<number | null> = []
  for (let index = 0; index < leadingBlanks; index += 1) {
    dayCells.push(null)
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    dayCells.push(day)
  }

  function isSelectedDay(day: number) {
    return (
      selectedMoment.jYear() === viewMoment.jYear() &&
      selectedMoment.jMonth() === viewMoment.jMonth() &&
      selectedMoment.jDate() === day
    )
  }

  function isToday(day: number) {
    return (
      todayMoment.jYear() === viewMoment.jYear() &&
      todayMoment.jMonth() === viewMoment.jMonth() &&
      todayMoment.jDate() === day
    )
  }

  function handleSelectDay(day: number) {
    const gregorianValue = moment(
      `${viewMoment.jYear()}/${viewMoment.jMonth() + 1}/${day}`,
      'jYYYY/jM/jD',
    ).format('YYYY-M-D')
    onChange(gregorianValue)
    setIsOpen(false)
  }

  function handleSelectToday() {
    onChange(todayMoment.format('YYYY-M-D'))
    setIsOpen(false)
  }

  return (
    <div className="jalali-date-picker" ref={rootRef}>
      <button
        className="jalali-date-picker__input"
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span
          className={`jalali-date-picker__input-value${
            value ? '' : ' jalali-date-picker__input-value--placeholder'
          }`}
        >
          {toJalaliDisplay(value) || placeholder}
        </span>
        <svg
          className="jalali-date-picker__icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </button>

      {isOpen ? (
        <div className="jalali-date-picker__popup" role="dialog">
          <div className="jalali-date-picker__header">
            <button
              className="jalali-date-picker__nav"
              type="button"
              aria-label="ماه قبل"
              onClick={() =>
                setViewMoment((current) => current.clone().subtract(1, 'jMonth'))
              }
            >
              ›
            </button>

            <span className="jalali-date-picker__title">
              {JALALI_MONTHS[viewMoment.jMonth()]}{' '}
              {toEnglishDigits(String(viewMoment.jYear()))}
            </span>

            <button
              className="jalali-date-picker__nav"
              type="button"
              aria-label="ماه بعد"
              onClick={() =>
                setViewMoment((current) => current.clone().add(1, 'jMonth'))
              }
            >
              ‹
            </button>
          </div>

          <div className="jalali-date-picker__weekdays">
            {JALALI_WEEKDAYS.map((weekday) => (
              <span key={weekday} className="jalali-date-picker__weekday">
                {weekday}
              </span>
            ))}
          </div>

          <div className="jalali-date-picker__days">
            {dayCells.map((day, index) =>
              day === null ? (
                <span
                  className="jalali-date-picker__empty"
                  key={`empty-${index}`}
                />
              ) : (
                <button
                  className={`jalali-date-picker__day${
                    isSelectedDay(day) ? ' jalali-date-picker__day--selected' : ''
                  }${isToday(day) ? ' jalali-date-picker__day--today' : ''}`}
                  type="button"
                  key={`day-${day}`}
                  onClick={() => handleSelectDay(day)}
                >
                  {toEnglishDigits(String(day))}
                </button>
              ),
            )}
          </div>

          <div className="jalali-date-picker__footer">
            <button
              className="jalali-date-picker__today"
              type="button"
              onClick={handleSelectToday}
            >
              امروز
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
