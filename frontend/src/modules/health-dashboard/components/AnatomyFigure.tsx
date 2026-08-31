
import { useId } from 'react';
import { motion } from 'framer-motion';

import { ORGAN_ASSETS, type OrganAsset, type OrganLayer } from '@ds/illustrations/anatomy/organ-assets';
import { BodyFigure } from '@ds/illustrations/anatomy/BodyFigure';
import {
  computeBodyShape,
  HEAD_ORGAN_KEYS,
  type BodyProfile,
} from '@ds/illustrations/anatomy/body-shape';
import { toPersianDigits } from '@core/text/digits';
import type { OrganKey } from '@survey/presentation/components/dashboard/organ-meta';
import { severityOf } from '@survey/presentation/components/dashboard/organ-meta';

interface Props {
  /** درصد ریسک هر ارگان؛ ارگان‌های غایب کم‌رنگ و غیرفعال‌اند */
  readonly organPercents: Partial<Record<OrganKey, number>>;
  readonly highlightedOrgan: OrganKey | null;
  readonly onSelectOrgan: (key: OrganKey) => void;
  /** قد/وزن/سن/جنسیت کاربر — شکلِ پیکره از این‌ها ساخته می‌شود. */
  readonly profile?: BodyProfile;
}

/** اندام‌های سر و تنه جدا رسم می‌شوند، چون تبدیلِ هم‌راستاسازی‌شان فرق دارد. */
const HEAD_ASSETS = ORGAN_ASSETS.filter((asset) => HEAD_ORGAN_KEYS.has(asset.key));
const TORSO_ASSETS = ORGAN_ASSETS.filter((asset) => !HEAD_ORGAN_KEYS.has(asset.key));

export function AnatomyFigure({ organPercents, highlightedOrgan, onSelectOrgan, profile }: Props) {
  const shape = computeBodyShape(profile);
  const bodyClipId = `anatomy-clip-${useId().replace(/:/g, '')}`;

  const renderZone = (assets: readonly OrganAsset[], transform: string) => (
    <g transform={transform}>
      {assets.map((asset) => {
        const percent = organPercents[asset.key];
        const isRelevant = percent != null;
        const severity = severityOf(percent ?? 0);
        const isActive = highlightedOrgan === asset.key;
        // با انتخابِ یک اندام، بقیه خاکستری می‌شوند تا نگاه سرِ جای درست بنشیند.
        const isDimmed = highlightedOrgan != null && !isActive;

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
            aria-pressed={isActive}
            className="cursor-pointer outline-none"
            onClick={() => onSelectOrgan(asset.key)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectOrgan(asset.key);
              }
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: isDimmed ? 0.32 : 1, scale: isActive ? 1.06 : 1 }}
            whileHover={{ opacity: 1, scale: 1.06 }}
            transition={{ type: 'spring', stiffness: 220, damping: 22 }}
            style={{
              transformOrigin: `${asset.halo.x}px ${asset.halo.y}px`,
              filter: isDimmed ? 'grayscale(1)' : undefined,
            }}
          >
            <circle
              cx={asset.halo.x}
              cy={asset.halo.y}
              r={asset.halo.r}
              fill={severity.hex}
              opacity={isDimmed ? 0.08 : isActive ? 0.3 : 0.16}
              style={{ filter: 'blur(6px)' }}
            />
            {asset.layers.map((layer, i) => (
              <OrganImage key={i} layer={layer} highlighted={isActive} glow={severity.hex} />
            ))}
            {/* نقطهٔ اتصالِ فلش به کارتِ همین اندام — با data-attribute پیدا می‌شود */}
            <circle
              data-organ-anchor={asset.key}
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
          const asset = assets.find((item) => item.key === highlightedOrgan);
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
              pointerEvents="none"
              initial={{ opacity: 0.9, scale: 0.6 }}
              animate={{ opacity: [0.9, 0], scale: [0.6, 2.2] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
              style={{ transformOrigin: `${asset.anchor.x}px ${asset.anchor.y}px` }}
            />
          );
        })()}
    </g>
  );

  return (
    <div className="w-full">
      <svg
        viewBox={shape.viewBox}
        className="mx-auto w-full max-w-[320px]"
        style={{ aspectRatio: '380 / 600' }}
        role="img"
        aria-label="نقشه آناتومی بدن"
      >
        <defs>
          {/* تضمینِ سختِ «هیچ اندامی از بدن بیرون نمی‌زند». محاسبهٔ مقیاسِ خوشه
              اندام‌ها را داخل نگه می‌دارد، ولی بزرگ‌نماییِ هاور و هالهٔ محو
              می‌توانند از لبه رد شوند؛ این کلیپ جلوی همه را می‌گیرد. */}
          <clipPath id={bodyClipId}>
            <path d={shape.bodyD} />
          </clipPath>
        </defs>
        <BodyFigure shape={shape} />
        <g clipPath={`url(#${bodyClipId})`}>
          {renderZone(TORSO_ASSETS, shape.organTransform)}
          {renderZone(HEAD_ASSETS, shape.headOrganTransform)}
        </g>
      </svg>
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
