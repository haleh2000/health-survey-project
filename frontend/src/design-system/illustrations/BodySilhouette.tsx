// src/design-system/illustrations/BodySilhouette.tsx
// Detailed anatomical body outline with semi-transparent fill
// Organs are rendered inside this silhouette by the BodyMap component
import type { SVGProps } from 'react';

export function BodySilhouette(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 400 600" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <linearGradient id="body-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
          <stop offset="40%" stopColor="currentColor" stopOpacity="0.18" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.12" />
        </linearGradient>
        <linearGradient id="body-outline-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.20" />
        </linearGradient>
      </defs>

      <g fill="url(#body-gradient)" stroke="url(#body-outline-gradient)" strokeWidth="1.2">
        {/* ─── Head ─── */}
        <ellipse cx="200" cy="42" rx="34" ry="40" />

        {/* ─── Neck ─── */}
        <path d="M186 80 C186 80 190 92 190 98 L190 108 L210 108 L210 98 C210 92 214 80 214 80 Z" />

        {/* ─── Shoulders + Torso ─── */}
        <path
          d="
            M190 108
            L162 112
            C138 116 120 128 114 148
            L108 178
            L106 210
            L108 250
            L114 290
            L122 320
            L132 345
            L144 362
            L156 372
            H244
            L256 362
            L268 345
            L278 320
            L286 290
            L292 250
            L294 210
            L292 178
            L286 148
            C280 128 262 116 238 112
            L210 108
            Z
          "
        />

        {/* ─── Left Arm ─── */}
        <path
          d="
            M114 148
            C102 152 92 160 84 174
            L76 196
            L68 224
            L62 258
            L58 290
            L56 318
            C55 332 58 338 64 338
            L68 336
            C74 334 76 328 78 318
            L84 286
            L90 250
            L96 218
            L104 190
            L108 178
            Z
          "
        />

        {/* ─── Right Arm ─── */}
        <path
          d="
            M286 148
            C298 152 308 160 316 174
            L324 196
            L332 224
            L338 258
            L342 290
            L344 318
            C345 332 342 338 336 338
            L332 336
            C326 334 324 328 322 318
            L316 286
            L310 250
            L304 218
            L296 190
            L292 178
            Z
          "
        />

        {/* ─── Left Leg ─── */}
        <path
          d="
            M156 372
            L152 398
            L148 428
            L144 462
            L142 496
            L140 528
            L138 554
            C137 568 140 576 148 578
            L162 578
            C168 578 170 574 170 568
            L168 540
            L170 508
            L174 476
            L178 444
            L184 414
            L192 388
            L196 378
            Z
          "
        />

        {/* ─── Right Leg ─── */}
        <path
          d="
            M244 372
            L248 398
            L252 428
            L256 462
            L258 496
            L260 528
            L262 554
            C263 568 260 576 252 578
            L238 578
            C232 578 230 574 230 568
            L232 540
            L230 508
            L226 476
            L222 444
            L216 414
            L212 388
            L208 378
            Z
          "
        />

        {/* ─── Skeletal hints (subtle) ─── */}
        <g fill="none" stroke="url(#body-outline-gradient)" strokeWidth="0.6" opacity="0.5">
          {/* Spine */}
          <line x1="200" y1="108" x2="200" y2="370" strokeDasharray="3 5" />
          {/* Ribcage outlines */}
          <path d="M160 140 Q200 132 240 140" strokeDasharray="2 4" />
          <path d="M152 158 Q200 148 248 158" strokeDasharray="2 4" />
          <path d="M148 176 Q200 164 252 176" strokeDasharray="2 4" />
          <path d="M148 194 Q200 182 252 194" strokeDasharray="2 4" />
          {/* Pelvis outline */}
          <path d="M148 340 Q200 360 252 340" strokeDasharray="2 4" />
          {/* Collarbone */}
          <path d="M148 118 Q200 112 252 118" />
        </g>
      </g>
    </svg>
  );
}
