// src/design-system/illustrations/anatomy/BodyFigure.tsx
// ─────────────────────────────────────────────────────────────────────────────
// پیکرهٔ انسانی (نمای قدامی) که با قد، وزن، سن و جنسیتِ کاربر شکل می‌گیرد.
// هندسه در body-shape.ts ساخته می‌شود؛ این‌جا فقط رنگ و سایه‌پردازی است.
//
// خروجی یک <g> است نه <svg>: اندام‌ها باید در همان دستگاه مختصاتِ بدن رسم شوند
// تا با تغییرِ تناسبِ بدن، دقیقاً سرِ جای خودشان بمانند.
//
// نکتهٔ رندر: مو و بدن دو مسیر جدا هستند. برای اینکه خطِ دورِ «اجتماعِ» آن‌ها
// یکپارچه دیده شود، اول هر دو با خطِ ضخیم کشیده می‌شوند و بعد هر دو پر می‌شوند؛
// هر تکه از خط که داخل دیگری بیفتد زیر رنگ می‌رود و فقط لبهٔ بیرونی می‌ماند.
// ─────────────────────────────────────────────────────────────────────────────
import { useId } from "react";

import { computeBodyShape, type BodyProfile, type BodyShape } from "./body-shape";

interface Props {
  /** مشخصات کاربر؛ اگر ندهید، پیکرهٔ پیش‌فرضِ بزرگسال رسم می‌شود. */
  readonly profile?: BodyProfile;
  /** اگر شکل را از قبل ساخته‌اید (مثلاً برای هم‌راستا کردنِ اندام‌ها) پاسش بدهید. */
  readonly shape?: BodyShape;
  readonly className?: string;
}

export function BodyFigure({ profile, shape, className }: Props) {
  const geometry = shape ?? computeBodyShape(profile);
  const uid = useId().replace(/:/g, "");

  const bodyId = `bf-body-${uid}`;
  const hairId = `bf-hair-${uid}`;
  const clipId = `bf-clip-${uid}`;
  const skinId = `bf-skin-${uid}`;
  const tightId = `bf-tight-${uid}`;

  const { hairD } = geometry;

  return (
    <g className={className}>
      <defs>
        <path id={bodyId} d={geometry.bodyD} />
        {hairD && <path id={hairId} d={hairD} />}

        <clipPath id={clipId}>
          <use href={`#${bodyId}`} />
          {hairD && <use href={`#${hairId}`} />}
        </clipPath>

        <linearGradient id={skinId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f7f5f2" />
          <stop offset="45%" stopColor="#f2efeb" />
          <stop offset="100%" stopColor="#ece8e3" />
        </linearGradient>

        <filter id={tightId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
      </defs>

      {/*
        خطِ دورِ یکپارچه (نیمهٔ داخلی‌اش زیر رنگِ بدنه می‌رود). عمداً نازک و
        نسبتاً پررنگ است: باریک‌ترین شکافِ سیلوئت، گودیِ بینِ دو انگشت، در ریشه
        حدودِ ۱٫۳ واحد است و به سمتِ نوک تا ~۵ واحد باز می‌شود. خطِ ۲ واحدی فقط
        ته‌ی گودی را می‌بندد (که همان پردهٔ بینِ انگشتان است) و بقیهٔ شکاف باز
        می‌ماند؛ با خطِ ضخیم‌تر، کلِ شکاف پر می‌شود و دست یک پارو می‌شود.
      */}
      <g fill="none" stroke="#a99f93" strokeWidth="2" strokeLinejoin="round" opacity="0.7">
        {hairD && <use href={`#${hairId}`} />}
        <use href={`#${bodyId}`} />
      </g>

      {/* بدنه، و مو رویِ آن — مو باید بالای جمجمه را بپوشاند نه پشتش برود */}
      <use href={`#${bodyId}`} fill={`url(#${skinId})`} />
      {hairD && <use href={`#${hairId}`} fill="#d9d1c6" />}

      {/*
        حجم‌دهیِ لبه — باریک و کلیپ‌شده داخلِ خودِ پیکره. هالهٔ پهنِ قبلی از دور
        شبیهِ سایه‌ای گردِ آدم دیده می‌شد، پس حذف شده است.

        پهنایش هم باید از نازک‌ترین عضوِ بدن کمتر بماند: با ۷ واحد، انگشتی که
        ۵ واحد پهناست تماماً زیرِ سایه می‌رفت و یک‌دست تیره می‌شد.
      */}
      <g clipPath={`url(#${clipId})`}>
        <use
          href={`#${bodyId}`}
          fill="none"
          stroke="#8f867c"
          strokeWidth="4"
          opacity="0.24"
          filter={`url(#${tightId})`}
        />
        {hairD && (
          <use
            href={`#${hairId}`}
            fill="none"
            stroke="#8f867c"
            strokeWidth="4"
            opacity="0.22"
            filter={`url(#${tightId})`}
          />
        )}
      </g>
    </g>
  );
}
