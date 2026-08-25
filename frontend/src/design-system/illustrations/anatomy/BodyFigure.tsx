// src/design-system/illustrations/anatomy/BodyFigure.tsx

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
  const softId = `bf-soft-${uid}`;
  const tightId = `bf-tight-${uid}`;

  const { hairD, groundShadow } = geometry;

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

        <filter id={softId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <filter id={tightId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
      </defs>

      {/* سایهٔ زیر پا */}
      <ellipse
        cx={groundShadow.cx}
        cy={groundShadow.cy}
        rx={groundShadow.rx}
        ry={5}
        fill="#000"
        opacity="0.06"
        filter={`url(#${softId})`}
      />

      {/* خطِ دورِ یکپارچه (نیمهٔ داخلی‌اش زیر رنگِ بدنه می‌رود) */}
      {/* <g fill="none" stroke="#b6ada2" strokeWidth="4.8" strokeLinejoin="round" opacity="0.5">
        {hairD && <use href={`#${hairId}`} />}
        <use href={`#${bodyId}`} />
      </g> */}

      {/* بدنه */}
      {hairD && <use href={`#${hairId}`} fill="#ded7cd" />}
      <use href={`#${bodyId}`} fill={`url(#${skinId})`} />

      {/* سایهٔ داخلی لبه‌ها — کلیپ‌شده داخل اجتماعِ مو و بدن */}
      <g clipPath={`url(#${clipId})`}>
        <use
          href={`#${bodyId}`}
          fill="none"
          stroke="#a89f95"
          strokeWidth="26"
          opacity="0.34"
          filter={`url(#${softId})`}
        />
        <use
          href={`#${bodyId}`}
          fill="none"
          stroke="#8f867c"
          strokeWidth="7"
          opacity="0.30"
          filter={`url(#${tightId})`}
        />
        {hairD && (
          <use
            href={`#${hairId}`}
            fill="none"
            stroke="#8f867c"
            strokeWidth="5"
            opacity="0.26"
            filter={`url(#${tightId})`}
          />
        )}
      </g>
    </g>
  );
}
