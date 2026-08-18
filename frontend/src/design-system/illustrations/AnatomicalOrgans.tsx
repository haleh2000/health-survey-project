// src/design-system/illustrations/AnatomicalOrgans.tsx
// Realistic anatomical organ SVG illustrations for the BodyMap
// Each organ is rendered as a detailed, recognizable shape rather than an abstract icon
import type { CSSProperties } from 'react';

interface OrganProps {
  className?: string;
  style?: CSSProperties;
}

/** Heart — anterior view with aorta, superior vena cava, ventricles */
export function HeartOrgan({ className, style }: OrganProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      {/* Aorta arch */}
      <path
        d="M28 10 C28 6 32 4 36 6 C40 8 40 12 38 14 L36 16"
        stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round"
      />
      {/* Superior vena cava */}
      <path
        d="M24 8 C24 6 26 5 28 6"
        stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round"
      />
      {/* Main heart body — left ventricle */}
      <path
        d="
          M18 16
          C12 16 8 22 8 28
          C8 36 14 44 22 52
          L32 60
          L42 52
          C50 44 56 36 56 28
          C56 22 52 16 46 16
          C42 16 38 18 32 24
          C26 18 22 16 18 16
          Z
        "
        fill="currentColor" opacity="0.85"
      />
      {/* Right ventricle overlay */}
      <path
        d="
          M32 28
          C26 32 22 36 22 42
          L32 52
          L32 28
          Z
        "
        fill="currentColor" opacity="0.5"
      />
      {/* Interventricular groove */}
      <path
        d="M32 26 L32 56"
        stroke="currentColor" strokeWidth="0.8" opacity="0.4" strokeLinecap="round"
      />
      {/* Left coronary artery hint */}
      <path
        d="M22 20 C26 24 28 30 26 38"
        stroke="currentColor" strokeWidth="0.7" fill="none" opacity="0.35" strokeLinecap="round"
      />
    </svg>
  );
}

/** Brain — superior-lateral view with cerebral hemispheres, cerebellum, brainstem */
export function BrainOrgan({ className, style }: OrganProps) {
  return (
    <svg viewBox="0 0 64 56" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      {/* Left hemisphere */}
      <path
        d="
          M30 8
          C22 8 14 12 10 20
          C6 28 6 36 10 42
          C12 45 16 47 20 48
          L30 48
          L30 8
          Z
        "
        fill="currentColor" opacity="0.82"
      />
      {/* Right hemisphere */}
      <path
        d="
          M34 8
          C42 8 50 12 54 20
          C58 28 58 36 54 42
          C52 45 48 47 44 48
          L34 48
          L34 8
          Z
        "
        fill="currentColor" opacity="0.75"
      />
      {/* Central fissure */}
      <path d="M32 6 L32 48" stroke="currentColor" strokeWidth="0.8" opacity="0.35" />
      {/* Cerebral sulci — left */}
      <g stroke="currentColor" strokeWidth="0.6" opacity="0.3" fill="none" strokeLinecap="round">
        <path d="M14 22 C18 20 24 22 28 24" />
        <path d="M12 30 C18 28 24 30 28 32" />
        <path d="M14 38 C18 36 24 37 28 38" />
        <path d="M18 16 C22 14 26 16 28 18" />
      </g>
      {/* Cerebral sulci — right */}
      <g stroke="currentColor" strokeWidth="0.6" opacity="0.3" fill="none" strokeLinecap="round">
        <path d="M50 22 C46 20 40 22 36 24" />
        <path d="M52 30 C46 28 40 30 36 32" />
        <path d="M50 38 C46 36 40 37 36 38" />
        <path d="M46 16 C42 14 38 16 36 18" />
      </g>
      {/* Cerebellum */}
      <path
        d="
          M18 48
          C16 50 18 54 22 54
          L32 54
          L42 54
          C46 54 48 50 46 48
          L32 46
          Z
        "
        fill="currentColor" opacity="0.6"
      />
      {/* Cerebellum folia */}
      <g stroke="currentColor" strokeWidth="0.5" opacity="0.25" fill="none">
        <path d="M22 50 L42 50" />
        <path d="M24 52 L40 52" />
      </g>
      {/* Brainstem */}
      <path
        d="M30 54 L30 58 C30 58 32 60 34 58 L34 54"
        fill="currentColor" opacity="0.5"
      />
    </svg>
  );
}

/** Lungs — anterior view with trachea, bronchi, right lung (3 lobes), left lung (2 lobes) */
export function LungsOrgan({ className, style }: OrganProps) {
  return (
    <svg viewBox="0 0 64 56" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      {/* Trachea */}
      <path
        d="M30 2 L30 14 M34 2 L34 14"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"
      />
      {/* Carina / bronchial split */}
      <path d="M30 14 C28 16 24 18 22 20" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.5" strokeLinecap="round" />
      <path d="M34 14 C36 16 40 18 42 20" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.5" strokeLinecap="round" />

      {/* Right lung — 3 lobes */}
      <path
        d="
          M22 14
          C16 16 10 22 8 30
          C6 38 8 46 12 50
          C16 54 22 54 28 52
          L30 50
          L30 14
          Z
        "
        fill="currentColor" opacity="0.78"
      />
      {/* Right horizontal fissure */}
      <path d="M10 34 C16 32 24 32 30 34" stroke="currentColor" strokeWidth="0.7" opacity="0.3" fill="none" />
      {/* Right oblique fissure */}
      <path d="M12 28 C18 32 22 40 28 46" stroke="currentColor" strokeWidth="0.7" opacity="0.3" fill="none" />

      {/* Left lung — 2 lobes */}
      <path
        d="
          M42 14
          C48 16 54 22 56 30
          C58 38 56 46 52 50
          C48 54 42 54 36 52
          L34 50
          L34 14
          Z
        "
        fill="currentColor" opacity="0.70"
      />
      {/* Left oblique fissure */}
      <path d="M52 28 C46 32 42 40 36 46" stroke="currentColor" strokeWidth="0.7" opacity="0.3" fill="none" />
      {/* Cardiac notch hint */}
      <path d="M34 28 C36 30 38 34 38 38" stroke="currentColor" strokeWidth="0.5" opacity="0.2" fill="none" />
    </svg>
  );
}

/** Liver — anterior view, large wedge-shaped organ */
export function LiverOrgan({ className, style }: OrganProps) {
  return (
    <svg viewBox="0 0 64 44" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      {/* Main liver body — right lobe (larger) */}
      <path
        d="
          M32 8
          C38 6 46 6 52 10
          C58 14 60 22 58 30
          C56 36 50 40 44 42
          L32 42
          L20 38
          C14 36 10 30 10 24
          C10 18 14 12 20 10
          C24 8 28 8 32 8
          Z
        "
        fill="currentColor" opacity="0.85"
      />
      {/* Left lobe (smaller, extends left) */}
      <path
        d="
          M32 14
          C26 12 18 12 14 16
          C10 20 10 26 14 30
          L32 34
          L32 14
          Z
        "
        fill="currentColor" opacity="0.65"
      />
      {/* Falciform ligament / division between lobes */}
      <path
        d="M32 10 L32 40"
        stroke="currentColor" strokeWidth="0.8" opacity="0.3" strokeLinecap="round"
      />
      {/* Hepatic veins hint */}
      <g stroke="currentColor" strokeWidth="0.5" opacity="0.25" fill="none" strokeLinecap="round">
        <path d="M36 12 C38 18 40 24 38 32" />
        <path d="M44 16 C46 22 46 28 44 34" />
      </g>
      {/* Gallbladder */}
      <ellipse
        cx="38" cy="36" rx="3" ry="5"
        fill="currentColor" opacity="0.45"
        transform="rotate(-10 38 36)"
      />
    </svg>
  );
}

/** Stomach — anterior view, J-shaped with esophagus and pylorus */
export function StomachOrgan({ className, style }: OrganProps) {
  return (
    <svg viewBox="0 0 56 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      {/* Esophagus */}
      <path
        d="M24 2 L24 16 C24 18 22 20 20 22"
        stroke="currentColor" strokeWidth="2" fill="none" opacity="0.55" strokeLinecap="round"
      />
      {/* Fundus */}
      <path
        d="
          M20 18
          C14 18 8 22 6 30
          C4 38 6 46 12 52
          C16 56 22 58 28 56
          C34 54 38 50 40 44
          L40 36
          C40 34 42 32 44 32
          L46 32
          C48 32 48 34 48 36
          L48 40
        "
        fill="currentColor" opacity="0.82"
      />
      {/* Greater curvature detail */}
      <path
        d="M6 30 C4 38 8 48 16 54"
        stroke="currentColor" strokeWidth="0.6" opacity="0.3" fill="none"
      />
      {/* Lesser curvature */}
      <path
        d="M20 22 C18 26 18 32 20 36"
        stroke="currentColor" strokeWidth="0.6" opacity="0.25" fill="none"
      />
      {/* Rugae folds */}
      <g stroke="currentColor" strokeWidth="0.5" opacity="0.2" fill="none">
        <path d="M12 32 C18 30 24 32 30 34" />
        <path d="M10 40 C16 38 22 40 28 42" />
        <path d="M14 48 C18 46 24 46 30 46" />
      </g>
      {/* Pylorus / duodenum exit */}
      <path
        d="M40 36 C42 34 44 32 46 32 L52 32"
        stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.45" strokeLinecap="round"
      />
    </svg>
  );
}

/** Colon — ascending, transverse, descending with haustra */
export function ColonOrgan({ className, style }: OrganProps) {
  return (
    <svg viewBox="0 0 64 56" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      {/* Ascending colon (right side) */}
      <path
        d="
          M14 48
          L14 38
          C14 36 16 34 18 34
          L18 20
          C18 18 16 16 14 16
          L14 10
          C14 8 16 6 18 6
          L46 6
          C48 6 50 8 50 10
          L50 16
          C50 18 48 20 46 20
          L46 34
          C46 36 48 38 50 38
          L50 48
        "
        stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.78"
        fill="none"
      />
      {/* Haustra (pouches) — ascending */}
      <g fill="currentColor" opacity="0.35">
        <circle cx="14" cy="14" r="3" />
        <circle cx="14" cy="22" r="3" />
        <circle cx="14" cy="30" r="3" />
        <circle cx="14" cy="40" r="3" />
      </g>
      {/* Haustra — transverse */}
      <g fill="currentColor" opacity="0.35">
        <circle cx="22" cy="6" r="3" />
        <circle cx="30" cy="6" r="3" />
        <circle cx="38" cy="6" r="3" />
        <circle cx="46" cy="6" r="3" />
      </g>
      {/* Haustra — descending */}
      <g fill="currentColor" opacity="0.35">
        <circle cx="50" cy="14" r="3" />
        <circle cx="50" cy="22" r="3" />
        <circle cx="50" cy="30" r="3" />
        <circle cx="50" cy="40" r="3" />
      </g>
      {/* Sigmoid / rectum exit */}
      <path
        d="M50 48 C48 50 44 52 40 52 L24 52 C20 52 18 50 16 48"
        stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" opacity="0.6" fill="none"
      />
    </svg>
  );
}

/** Pancreas — elongated organ with head, body, tail */
export function PancreasOrgan({ className, style }: OrganProps) {
  return (
    <svg viewBox="0 0 64 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      {/* Main pancreas body */}
      <path
        d="
          M8 18
          C8 12 12 8 18 8
          L24 8
          C26 8 28 10 30 12
          L38 16
          C42 18 46 18 50 16
          C54 14 58 14 60 16
          C62 18 62 22 58 24
          C54 26 48 26 42 24
          L34 20
          C30 18 26 18 22 20
          C18 22 14 24 10 24
          C8 24 6 22 6 20
          Z
        "
        fill="currentColor" opacity="0.82"
      />
      {/* Pancreatic duct */}
      <path
        d="M10 18 C18 16 28 16 38 18 C46 20 54 20 58 18"
        stroke="currentColor" strokeWidth="0.8" opacity="0.3" fill="none" strokeLinecap="round"
      />
      {/* Head detail (wider) */}
      <ellipse cx="14" cy="16" rx="6" ry="7" fill="currentColor" opacity="0.3" />
      {/* Uncinate process hint */}
      <path
        d="M10 22 C8 24 8 26 12 26 L18 24"
        stroke="currentColor" strokeWidth="0.7" opacity="0.25" fill="none" strokeLinecap="round"
      />
      {/* Tail tapering toward spleen */}
      <path
        d="M54 16 C58 15 62 16 62 18"
        stroke="currentColor" strokeWidth="0.6" opacity="0.25" fill="none" strokeLinecap="round"
      />
    </svg>
  );
}

/** Metabolic — stylized representation combining liver-pancreas metabolic system */
export function MetabolicOrgan({ className, style }: OrganProps) {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      {/* Central metabolic hub — mitochondria-inspired shape */}
      <ellipse cx="28" cy="28" rx="16" ry="12" fill="currentColor" opacity="0.7" />
      {/* Inner membrane folds (cristae) */}
      <g stroke="currentColor" strokeWidth="1" opacity="0.35" fill="none" strokeLinecap="round">
        <path d="M18 22 C20 26 24 28 20 32" />
        <path d="M24 20 C26 24 30 26 26 30" />
        <path d="M30 20 C32 24 36 26 32 30" />
        <path d="M36 22 C38 26 40 28 38 32" />
      </g>
      {/* Insulin / glucose symbols — small circles representing metabolic activity */}
      <g fill="currentColor" opacity="0.5">
        <circle cx="14" cy="28" r="2.5" />
        <circle cx="42" cy="28" r="2.5" />
        <circle cx="28" cy="18" r="2" />
        <circle cx="28" cy="38" r="2" />
      </g>
      {/* Connecting arrows suggesting metabolic pathways */}
      <g stroke="currentColor" strokeWidth="0.7" opacity="0.3" fill="none" strokeLinecap="round">
        <path d="M16 28 L22 28" />
        <path d="M34 28 L40 28" />
        <path d="M28 20 L28 24" />
        <path d="M28 32 L28 36" />
      </g>
    </svg>
  );
}
