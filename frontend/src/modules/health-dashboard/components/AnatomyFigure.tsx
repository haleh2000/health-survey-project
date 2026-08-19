// src/modules/health-dashboard/components/AnatomyFigure.tsx
// نسخهٔ نمایشیِ بدن: پیکره + ارگان‌ها + هالهٔ ریسک، بدون کارت داخلی.
// کلیک روی هر ارگان فقط به والد اطلاع می‌دهد (برای باز کردن کارت آکاردئون).

import { motion } from 'framer-motion';

import { ORGAN_ASSETS, type OrganLayer } from '@ds/illustrations/anatomy/organ-assets';
import { BodyFigure } from '@ds/illustrations/anatomy/BodyFigure';
import { toPersianDigits } from '@core/text/digits';
import type { OrganKey } from '@survey/presentation/components/dashboard/organ-meta';
import { severityOf } from '@survey/presentation/components/dashboard/organ-meta';

const VIEW_W = 340;
const VIEW_H = 600;

interface Props {
  /** درصد ریسک هر ارگان؛ ارگان‌های غایب کم‌رنگ و غیرفعال‌اند */
  readonly organPercents: Partial<Record<OrganKey, number>>;
  readonly highlightedOrgan: OrganKey | null;
  readonly onSelectOrgan: (key: OrganKey) => void;
}

export function AnatomyFigure({ organPercents, highlightedOrgan, onSelectOrgan }: Props) {
  return (
    <div className="w-full">
      <svg
        viewBox={`${(400 - VIEW_W) / 2} 0 ${VIEW_W} ${VIEW_H}`}
        className="mx-auto w-full max-w-[300px]"
        style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}
        role="img"
        aria-label="نقشهٔ آناتومی بدن"
      >
        <BodyFigure x={0} y={0} width={400} height={600} />

        {ORGAN_ASSETS.map((asset) => {
          const percent = organPercents[asset.key];
          const isRelevant = percent != null;
          const severity = severityOf(percent ?? 0);
          const isActive = highlightedOrgan === asset.key;

          if (!isRelevant) {
            return (
              <g key={asset.key} opacity={0.16} style={{ filter: 'grayscale(1)' }} pointerEvents="none">
                {asset.layers.map((layer, i) => (
                  <OrganImage key={i} layer={layer} />
                ))}
              </g>
            );
          }

          return (
            <motion.g
              key={asset.key}
              role="button"
              tabIndex={0}
              aria-label={`${asset.label} — ${toPersianDigits(percent)} درصد`}
              className="cursor-pointer outline-none"
              onClick={() => onSelectOrgan(asset.key)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectOrgan(asset.key);
                }
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, scale: isActive ? 1.06 : 1 }}
              whileHover={{ scale: 1.06 }}
              transition={{ type: 'spring', stiffness: 220, damping: 22 }}
              style={{ transformOrigin: `${asset.halo.x}px ${asset.halo.y}px` }}
            >
              <circle
                cx={asset.halo.x}
                cy={asset.halo.y}
                r={asset.halo.r}
                fill={severity.hex}
                opacity={isActive ? 0.3 : 0.16}
                style={{ filter: 'blur(6px)' }}
              />
              {asset.layers.map((layer, i) => (
                <OrganImage key={i} layer={layer} highlighted={isActive} glow={severity.hex} />
              ))}
              <circle
                cx={asset.anchor.x}
                cy={asset.anchor.y}
                r={4}
                fill={severity.hex}
                stroke="#fff"
                strokeWidth={1.5}
              />
            </motion.g>
          );
        })}

        {/* نبض روی ارگانِ کارتِ باز */}
        {highlightedOrgan &&
          (() => {
            const asset = ORGAN_ASSETS.find((a) => a.key === highlightedOrgan);
            if (!asset || organPercents[asset.key] == null) return null;
            const severity = severityOf(organPercents[asset.key] ?? 0);
            return (
              <motion.circle
                cx={asset.anchor.x}
                cy={asset.anchor.y}
                r={10}
                fill="none"
                stroke={severity.hex}
                strokeWidth={2}
                initial={{ opacity: 0.9, scale: 0.6 }}
                animate={{ opacity: [0.9, 0], scale: [0.6, 2.2] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                style={{ transformOrigin: `${asset.anchor.x}px ${asset.anchor.y}px` }}
              />
            );
          })()}
      </svg>

      {/* ذکر منبع تصاویر — الزام مجوز CC BY 4.0 */}
      <p className="mt-2 text-center text-[10px] text-ink-subtle/80">
        تصاویر آناتومی:{' '}
        <a
          href="https://smart.servier.com"
          target="_blank"
          rel="noreferrer noopener"
          className="underline decoration-dotted underline-offset-2"
        >
          Servier Medical Art
        </a>{' '}
        — CC BY 4.0
      </p>
    </div>
  );
}

function OrganImage({
  layer,
  highlighted,
  glow,
}: {
  layer: OrganLayer;
  highlighted?: boolean;
  glow?: string;
}) {
  const centerX = layer.x + layer.width / 2;
  return (
    <image
      href={layer.href}
      x={layer.x}
      y={layer.y}
      width={layer.width}
      height={layer.height}
      preserveAspectRatio="xMidYMid meet"
      opacity={layer.muted ? 0.65 : 1}
      transform={layer.mirrored ? `translate(${centerX * 2}, 0) scale(-1, 1)` : undefined}
      style={
        highlighted && glow
          ? { filter: `drop-shadow(0 0 5px ${glow}) drop-shadow(0 1px 2px rgba(0,0,0,0.25))` }
          : { filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.18))' }
      }
    />
  );
}
