import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import type { OrganKey } from '@survey/presentation/components/dashboard/organ-meta';

export interface ConnectorTarget {
  readonly key: OrganKey;
  readonly color: string;
}

interface Props {
  readonly hostRef: React.RefObject<HTMLElement | null>;
  readonly targets: readonly ConnectorTarget[];
  readonly highlightedOrgan: OrganKey | null;

  readonly layoutSignal?: unknown;
}

interface Connector {
  readonly key: OrganKey;
  readonly color: string;
  readonly path: string;
  readonly tipX: number;
  readonly tipY: number;
  readonly direction: 1 | -1;
  readonly originX: number;
  readonly originY: number;
}

const CARD_GAP = 6;
/** نقطهٔ اتصال روی کارت: هم‌ترازِ سطرِ عنوان، نه وسطِ کارتِ باز */
const CARD_ANCHOR_OFFSET = 26;
/** حداقل فاصلهٔ افقی لازم تا خط اتصال معنا داشته باشد (چیدمان ستونی = بدون خط) */
const MIN_HORIZONTAL_GAP = 24;
/** مدت دنبال کردنِ انیمیشن‌های چیدمان بعد از هر تغییر */
const FOLLOW_MS = 900;
/** شعاع نقطهٔ توپر در انتهای خط (حالت عادی / فعال) */
const DOT_RADIUS = 3;
const DOT_RADIUS_ACTIVE = 4;

export function OrganConnectors({ hostRef, targets, highlightedOrgan, layoutSignal }: Props) {
  const [connectors, setConnectors] = useState<readonly Connector[]>([]);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const followUntilRef = useRef(0);
  const frameRef = useRef<number | null>(null);

  const measure = useCallback(() => {
    const host = hostRef.current;
    if (!host) return;

    const hostRect = host.getBoundingClientRect();
    if (hostRect.width === 0) return;

    const next: Connector[] = [];

    for (const target of targets) {
      const anchor = host.querySelector<SVGCircleElement>(
        `[data-organ-anchor="${target.key}"]`,
      );
      const card = document.getElementById(`organ-card-${target.key}`);
      if (!anchor || !card) continue;

      const anchorRect = anchor.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      if (anchorRect.width === 0 || cardRect.width === 0) continue;

      const originX = anchorRect.left + anchorRect.width / 2 - hostRect.left;
      const originY = anchorRect.top + anchorRect.height / 2 - hostRect.top;

      // کارت سمت چپِ بدن است یا سمت راستش؟ اگر هم‌پوشانی افقی داشتند،
      // یعنی چیدمان ستونی است و خط رسم نمی‌شود.
      let tipX: number;
      let direction: 1 | -1;
      if (cardRect.left - anchorRect.right >= MIN_HORIZONTAL_GAP) {
        direction = 1;
        tipX = cardRect.left - hostRect.left - CARD_GAP;
      } else if (anchorRect.left - cardRect.right >= MIN_HORIZONTAL_GAP) {
        direction = -1;
        tipX = cardRect.right - hostRect.left + CARD_GAP;
      } else {
        continue;
      }

      const tipY =
        cardRect.top -
        hostRect.top +
        Math.min(CARD_ANCHOR_OFFSET, cardRect.height / 2);

      const dx = tipX - originX;
      const curve = Math.max(Math.abs(dx) * 0.45, 28);
      const path = `M ${originX} ${originY} C ${originX + direction * curve} ${originY}, ${
        tipX - direction * curve
      } ${tipY}, ${tipX} ${tipY}`;

      next.push({ key: target.key, color: target.color, path, tipX, tipY, direction, originX, originY });
    }

    setSize({ width: hostRect.width, height: hostRect.height });
    setConnectors(next);
  }, [hostRef, targets]);

  /** اندازه‌گیریِ پیوسته تا وقتی انیمیشن‌های چیدمان تمام شوند */
  const startFollowing = useCallback(() => {
    followUntilRef.current = performance.now() + FOLLOW_MS;
    if (frameRef.current !== null) return;

    const tick = () => {
      measure();
      if (performance.now() < followUntilRef.current) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        frameRef.current = null;
      }
    };
    frameRef.current = requestAnimationFrame(tick);
  }, [measure]);

  useLayoutEffect(() => {
    startFollowing();
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [startFollowing, targets, highlightedOrgan, layoutSignal]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const onViewportChange = () => measure();
    window.addEventListener('resize', onViewportChange);
    // بدن sticky است؛ با اسکرول، مبدأ خط‌ها جابه‌جا می‌شود.
    window.addEventListener('scroll', onViewportChange, true);

    const observer = new ResizeObserver(() => measure());
    observer.observe(host);

    return () => {
      window.removeEventListener('resize', onViewportChange);
      window.removeEventListener('scroll', onViewportChange, true);
      observer.disconnect();
    };
  }, [hostRef, measure]);

  if (connectors.length === 0 || size.width === 0) return null;

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-0 h-full w-full"
      width={size.width}
      height={size.height}
      viewBox={`0 0 ${size.width} ${size.height}`}
      aria-hidden
    >
      <AnimatePresence>
        {connectors.map((connector) => {
          const isActive = highlightedOrgan === connector.key;
          const dim = highlightedOrgan !== null && !isActive;

          return (
            <motion.g
              key={connector.key}
              initial={{ opacity: 0 }}
              animate={{ opacity: dim ? 0.18 : isActive ? 1 : 0.45 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <motion.path
                d={connector.path}
                fill="none"
                stroke={connector.color}
                strokeWidth={isActive ? 2 : 1.4}
                strokeLinecap="round"
                strokeDasharray={isActive ? undefined : '4 4'}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ type: 'spring', stiffness: 90, damping: 20 }}
              />
              {/* نقطهٔ توپر در انتهای خط، سمتِ کارت */}
              <motion.circle
                cx={connector.tipX}
                cy={connector.tipY}
                r={isActive ? DOT_RADIUS_ACTIVE : DOT_RADIUS}
                fill={connector.color}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.15 }}
              />
            </motion.g>
          );
        })}
      </AnimatePresence>
    </svg>
  );
}
