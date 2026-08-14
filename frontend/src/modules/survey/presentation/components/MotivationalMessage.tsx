// src/modules/survey/components/MotivationalMessage.tsx
import { useMemo } from 'react';
import { toPersianDigits } from '@core/utils/numbers';

interface MotivationalMessageProps {
  answeredCount: number;
  totalCount: number;
  className?: string;
}

export function MotivationalMessage({
  answeredCount,
  totalCount,
  className = '',
}: MotivationalMessageProps) {
  const remainingQuestions = totalCount - answeredCount;

  const message = useMemo(() => {
    const persianCount = toPersianDigits(remainingQuestions);
    const progress = totalCount > 0 ? answeredCount / totalCount : 0;

    if (answeredCount === 0) {
      return 'بزن بریم! 🚀';
    }

    if (remainingQuestions === 0) {
      return 'تمام! آماده‌ی دیدن نتیجت هستی؟';
    }

    if (remainingQuestions === 1) {
      return `فقط ${persianCount} سوال دیگه تا نتیجه‌ت! 🎯`;
    }

    if (progress < 0.25) {
      return `${persianCount} سوال دیگه، بریم! ✨`;
    }

    if (progress < 0.5) {
      return `${persianCount} سوال مونده، خوب پیش می‌ری! 💪`;
    }

    if (progress < 0.75) {
      return `نصف راه رو رفتی! ${persianCount} سوال مونده 🔥`;
    }

    if (progress < 0.9) {
      return `${persianCount} سوال دیگه، نزدیکی! 🎯`;
    }

    return `${persianCount} سوال دیگه تا نتیجه‌ت! 🚀`;
  }, [answeredCount, remainingQuestions, totalCount]);

  return (
    <div className={`text-sm text-white font-medium ${className}`}>
      {message}
    </div>
  );
}
