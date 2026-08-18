// src/modules/health-dashboard/components/AnatomyExplorer.tsx
// ─────────────────────────────────────────────────────────────────────────────
// اکسپلورر آناتومی دوبعدی
//  • فقط ارگان‌هایی که به گروه/ریسک کاربر مربوط‌اند فعال و رنگی هستند
//  • با کلیک روی ارگان، کارت آن با «خط راهنما + فلش» کنار همان ارگان باز می‌شود
//    (به‌جای آکاردئون سمت راست)
// ─────────────────────────────────────────────────────────────────────────────
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';

import { BodyFigure } from '@ds/illustrations/anatomy/BodyFigure';
import { ORGAN_ASSETS, type OrganLayer } from '@ds/illustrations/anatomy/organ-assets';
import { toPersianDigits } from '@core/text/digits';
import type { OrganKey } from '@survey/presentation/components/dashboard/organ-meta';
import { ORGAN_CONTENT, severityOf } from '@survey/presentation/components/dashboard/organ-meta';

/** فضای افقی دو طرف بدن برای نشستن کارت‌ها (در مختصات SVG) */
const GUTTER = 165;
const VIEW_W = 400 + GUTTER * 2; // 730
const VIEW_H = 600;
/** لبهٔ داخلی کارت‌ها به‌صورت درصدی از عرض ظرف */
const CARD_WIDTH_PCT = 31;

interface Props {
  /** درصد ریسک هر ارگان؛ ارگان‌های غایب = نامرتبط با گروه کاربر */
  organPercents: Partial<Record<OrganKey, number>>;
  selectedOrgan: OrganKey | null;
  onSelectOrgan: (key: OrganKey | null) => void;
}

function useIsCompact() {
  const [compact, setCompact] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const onChange = (e: MediaQueryListEvent) => setCompact(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return compact;
}

export function AnatomyExplorer({ organPercents, selectedOrgan, onSelectOrgan }: Props) {
  const compact = useIsCompact();

  /** فقط ارگان‌های مرتبط با وضعیت کاربر تعاملی‌اند؛ بقیه محو و غیرفعال */
  const relevant = useMemo(
    () => ORGAN_ASSETS.filter((asset) => organPercents[asset.key] != null),
    [organPercents],
  );
  const [hovered, setHovered] = useState<OrganKey | null>(null);

  const selected = selectedOrgan ? ORGAN_ASSETS.find((a) => a.key === selectedOrgan) ?? null : null;
  const selectedPercent = selected ? organPercents[selected.key] ?? 0 : 0;
  const selectedSeverity = severityOf(selectedPercent);

  // در حالت فشرده روی خود بدن زوم می‌کنیم و کارت زیر تصویر می‌نشیند
  const COMPACT_W = 340;
  const viewBox = compact
    ? `${GUTTER + (400 - COMPACT_W) / 2} 0 ${COMPACT_W} ${VIEW_H}`
    : `0 0 ${VIEW_W} ${VIEW_H}`;

  return (
    <div className="w-full">
      <div className={`relative mx-auto w-full ${compact ? 'max-w-[330px]' : 'max-w-[820px]'}`}>
        <svg
          viewBox={viewBox}
          className="w-full"
          style={{ aspectRatio: compact ? `${COMPACT_W} / ${VIEW_H}` : `${VIEW_W} / ${VIEW_H}` }}
          role="img"
          aria-label="نقشهٔ آناتومی بدن"
        >
          <g transform={`translate(${GUTTER}, 0)`}>
            <BodyFigure
              x={0}
              y={0}
              width={400}
              height={600}
              className="text-slate-400 dark:text-slate-500"
            />

            {ORGAN_ASSETS.map((asset) => {
              const percent = organPercents[asset.key];
              const isRelevant = percent != null;
              const isSelected = selectedOrgan === asset.key;
              const isHovered = hovered === asset.key;
              const severity = severityOf(percent ?? 0);
              const dimmed = selectedOrgan != null && !isSelected;

              // ارگان نامرتبط با وضعیت کاربر: فقط سایهٔ محو و بدون تعامل
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
                  onClick={() => onSelectOrgan(isSelected ? null : asset.key)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectOrgan(isSelected ? null : asset.key);
                    }
                  }}
                  onMouseEnter={() => setHovered(asset.key)}
                  onMouseLeave={() => setHovered(null)}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: dimmed ? 0.45 : 1,
                    scale: isSelected || isHovered ? 1.05 : 1,
                  }}
                  transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                  style={{
                    transformOrigin: `${asset.halo.x}px ${asset.halo.y}px`,
                    filter: dimmed ? 'saturate(0.45)' : undefined,
                  }}
                >
                  {/* هالهٔ رنگی = سطح ریسک؛ خود عضو رنگ طبیعی خودش را نگه می‌دارد */}
                  <circle
                    cx={asset.halo.x}
                    cy={asset.halo.y}
                    r={asset.halo.r}
                    fill={severity.hex}
                    opacity={isSelected || isHovered ? 0.3 : 0.16}
                    style={{ filter: 'blur(6px)' }}
                  />
                  {asset.layers.map((layer, i) => (
                    <OrganImage
                      key={i}
                      layer={layer}
                      highlighted={isSelected || isHovered}
                      glow={severity.hex}
                    />
                  ))}
                  {/* نشانگر ریسک کنار عضو */}
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

            {/* نبض روی ارگان انتخاب‌شده */}
            {selected && (
              <motion.circle
                cx={selected.anchor.x}
                cy={selected.anchor.y}
                r={10}
                fill="none"
                stroke={selectedSeverity.hex}
                strokeWidth={2}
                initial={{ opacity: 0.9, scale: 0.6 }}
                animate={{ opacity: [0.9, 0], scale: [0.6, 2.2] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                style={{ transformOrigin: `${selected.anchor.x}px ${selected.anchor.y}px` }}
              />
            )}
          </g>

          {/* خط راهنما از ارگان تا کارت (فقط دسکتاپ) */}
          {selected && !compact && (
            <LeaderLine
              anchorX={selected.anchor.x + GUTTER}
              anchorY={selected.anchor.y}
              side={selected.side}
              color={selectedSeverity.hex}
            />
          )}
        </svg>

        {/* کارت ارگان */}
        <AnimatePresence mode="wait">
          {selected && (
            <motion.div
              key={selected.key}
              initial={{ opacity: 0, x: compact ? 0 : selected.side === 'left' ? -24 : 24, y: compact ? 16 : 0 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: compact ? 0 : selected.side === 'left' ? -16 : 16, y: compact ? 12 : 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 26 }}
              style={
                compact
                  ? undefined
                  : {
                      top: `${Math.min(Math.max((selected.anchor.y - 70) / VIEW_H, 0.02), 0.62) * 100}%`,
                      width: `${CARD_WIDTH_PCT}%`,
                      left: selected.side === 'left' ? 0 : undefined,
                      right: selected.side === 'right' ? 0 : undefined,
                    }
              }
              className={compact ? 'mt-4 w-full' : 'absolute z-20'}
            >
              <OrganCard
                organKey={selected.key}
                label={selected.label}
                percent={selectedPercent}
                pointer={compact ? 'top' : selected.side === 'left' ? 'end' : 'start'}
                onClose={() => onSelectOrgan(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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

      {/* ردیف انتخاب سریع ارگان‌های مرتبط */}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {relevant.map((asset) => {
          const percent = organPercents[asset.key] ?? 0;
          const severity = severityOf(percent);
          const isSelected = selectedOrgan === asset.key;
          return (
            <button
              key={asset.key}
              type="button"
              onClick={() => onSelectOrgan(isSelected ? null : asset.key)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold transition cursor-pointer ${
                isSelected ? 'border-transparent text-white shadow-card' : 'border-line bg-surface/70 text-ink-muted hover:border-day-primary/40'
              }`}
              style={isSelected ? { backgroundColor: severity.hex } : undefined}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: isSelected ? '#fff' : severity.hex }}
                aria-hidden
              />
              {asset.label}
              <span className="tabular-nums opacity-80">{toPersianDigits(percent)}٪</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** یک لایهٔ تصویری از ارگان؛ در صورت نیاز حول مرکز خودش قرینه می‌شود. */
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

/** خط راهنمای زاویه‌دار با نوک فلش روی ارگان */
function LeaderLine({
  anchorX,
  anchorY,
  side,
  color,
}: {
  anchorX: number;
  anchorY: number;
  side: 'left' | 'right';
  color: string;
}) {
  const cardEdge = side === 'left' ? (CARD_WIDTH_PCT / 100) * VIEW_W : VIEW_W - (CARD_WIDTH_PCT / 100) * VIEW_W;
  const bendX = side === 'left' ? anchorX - 34 : anchorX + 34;
  const bendY = anchorY - 34;

  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      pointerEvents="none"
    >
      <motion.polyline
        points={`${anchorX},${anchorY} ${bendX},${bendY} ${cardEdge},${bendY}`}
        fill="none"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeDasharray="5 4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      />
      <circle cx={anchorX} cy={anchorY} r={3.5} fill={color} />
      <circle cx={cardEdge} cy={bendY} r={2.5} fill={color} />
    </motion.g>
  );
}

/** کارت اطلاعات ارگان — همان محتوای قبلی آکاردئون، حالا شناور کنار ارگان */
function OrganCard({
  organKey,
  label,
  percent,
  pointer,
  onClose,
}: {
  organKey: OrganKey;
  label: string;
  percent: number;
  pointer: 'start' | 'end' | 'top';
  onClose: () => void;
}) {
  const content = ORGAN_CONTENT[organKey];
  const severity = severityOf(percent);

  const pointerClass =
    pointer === 'top'
      ? 'right-1/2 -top-1.5 translate-x-1/2'
      : pointer === 'start'
        ? 'right-[-6px] top-8'
        : 'left-[-6px] top-8';

  return (
    <div
      className="relative rounded-2xl border bg-surface/95 p-4 shadow-card backdrop-blur-xl"
      style={{ borderColor: `${severity.hex}55` }}
    >
      {/* نوک فلش کارت */}
      <span
        className={`absolute h-3 w-3 rotate-45 border bg-surface ${pointerClass}`}
        style={{ borderColor: `${severity.hex}55` }}
        aria-hidden
      />

      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <h4 className="text-sm font-black text-ink">{label}</h4>
          <span className={`text-[11px] font-bold ${severity.textClass}`}>
            {severity.label} · {toPersianDigits(percent)}٪
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-ink-subtle transition hover:bg-surface-muted cursor-pointer"
          aria-label="بستن"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* نوار وضعیت */}
      <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: severity.hex }}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
      </div>

      <p className="text-[11px] leading-relaxed text-ink-subtle">{content.description}</p>

      <h5 className="mb-1.5 mt-3 text-[11px] font-bold text-ink">توصیه‌های سلامت</h5>
      <ul className="space-y-1">
        {content.tips.map((tip) => (
          <li key={tip} className="flex items-start gap-1.5">
            <span
              className="mt-1.5 h-1 w-1 shrink-0 rounded-full"
              style={{ backgroundColor: severity.hex }}
              aria-hidden
            />
            <span className="text-[11px] leading-relaxed text-ink-subtle">{tip}</span>
          </li>
        ))}
      </ul>

      <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2.5 dark:border-red-900 dark:bg-red-950/30">
        <h5 className="mb-0.5 text-[11px] font-bold text-red-700 dark:text-red-400">علائم هشداردهنده</h5>
        <p className="text-[11px] leading-relaxed text-red-600 dark:text-red-400/80">{content.warningSign}</p>
      </div>
    </div>
  );
}
