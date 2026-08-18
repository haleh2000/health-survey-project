// src/design-system/illustrations/anatomy/BodyFigure.tsx
// ─────────────────────────────────────────────────────────────────────────────
// پیکرهٔ انسانی (نمای قدامی) با تناسبات آناتومیک، در دستگاه مختصات "0 0 400 600".
// نقش آن پس‌زمینهٔ شفاف برای تصاویر ارگان‌هاست: پوست نیمه‌شفاف + اشارهٔ اسکلت.
// عرض تنه: قفسهٔ سینه ≈ x ۱۳۴..۲۶۶ و شکم ≈ x ۱۴۶..۲۵۴
// ─────────────────────────────────────────────────────────────────────────────
import type { SVGProps } from 'react';

export function BodyFigure(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 400 600" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <linearGradient id="figure-skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.20" />
          <stop offset="55%" stopColor="currentColor" stopOpacity="0.14" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.09" />
        </linearGradient>
        <linearGradient id="figure-edge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.42" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.22" />
        </linearGradient>
      </defs>

      <g fill="url(#figure-skin)" stroke="url(#figure-edge)" strokeWidth="1.1" strokeLinejoin="round">
        {/* سر و گردن */}
        <path d="M200 4 C182 4 169 19 169 40 C169 56 176 70 187 76 L187 92 C187 98 181 101 172 104 L228 104 C219 101 213 98 213 92 L213 76 C224 70 231 56 231 40 C231 19 218 4 200 4 Z" />

        {/* تنه: شانه → قفسهٔ سینه → کمر → لگن */}
        <path
          d="
            M186 100
            C170 102 156 106 148 112
            C138 120 134 134 134 150
            L136 186
            L140 220
            L146 250
            L148 276
            L146 306
            C145 326 150 342 158 354
            L172 372
            H228
            L242 354
            C250 342 255 326 254 306
            L252 276
            L254 250
            L260 220
            L264 186
            L266 150
            C266 134 262 120 252 112
            C244 106 230 102 214 100
            Z
          "
        />

        {/* بازوی سمت چپ تصویر */}
        <path
          d="
            M136 118
            C124 124 116 136 112 152
            L104 190 L98 226 L94 262 L92 292
            C91 306 94 314 100 314
            C105 314 108 309 109 300
            L114 266 L120 232 L126 198 L132 168
            Z
          "
        />
        {/* بازوی سمت راست تصویر */}
        <path
          d="
            M264 118
            C276 124 284 136 288 152
            L296 190 L302 226 L306 262 L308 292
            C309 306 306 314 300 314
            C295 314 292 309 291 300
            L286 266 L280 232 L274 198 L268 168
            Z
          "
        />

        {/* پای سمت چپ تصویر */}
        <path
          d="
            M172 372
            L168 404 L164 440 L162 478 L162 514 L164 548
            C165 562 168 570 176 570
            L188 570 C193 570 195 566 195 560
            L193 520 L194 480 L196 442 L198 406 L200 378
            Z
          "
        />
        {/* پای سمت راست تصویر */}
        <path
          d="
            M228 372
            L232 404 L236 440 L238 478 L238 514 L236 548
            C235 562 232 570 224 570
            L212 570 C207 570 205 566 205 560
            L207 520 L206 480 L204 442 L202 406 L200 378
            Z
          "
        />

        {/* اشارهٔ اسکلت: ستون فقرات، دنده‌ها، لگن، ترقوه */}
        <g fill="none" stroke="url(#figure-edge)" strokeWidth="0.7" opacity="0.5">
          <line x1="200" y1="104" x2="200" y2="352" strokeDasharray="3 6" />
          <path d="M152 128 Q200 120 248 128" />
          <path d="M144 150 Q200 140 256 150" strokeDasharray="2 4" />
          <path d="M140 172 Q200 160 260 172" strokeDasharray="2 4" />
          <path d="M139 194 Q200 182 261 194" strokeDasharray="2 4" />
          <path d="M141 216 Q200 204 259 216" strokeDasharray="2 4" />
          <path d="M150 300 Q200 322 250 300" strokeDasharray="2 4" />
          <path d="M156 316 Q200 340 244 316" strokeDasharray="2 4" />
        </g>
      </g>
    </svg>
  );
}
