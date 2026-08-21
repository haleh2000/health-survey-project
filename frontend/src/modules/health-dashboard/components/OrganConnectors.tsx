// src/modules/health-dashboard/components/OrganConnectors.tsx
// ─────────────────────────────────────────────────────────────────────────────
// فلش‌های اتصال: هر اندام روی نقشهٔ بدن با یک منحنی به کارتِ توصیهٔ خودش
// وصل می‌شود.
//
// کارت‌ها دو طرفِ بدن می‌نشینند، پس مسیرها را نمی‌شود داخل SVG بدن کشید؛
// به‌جایش یک لایهٔ SVG روی کل ناحیه (و روی خودِ بدن) قرار می‌گیرد و مختصات دو
// سر هر فلش از روی DOM اندازه‌گیری می‌شود:
//   • مبدأ  → دایرهٔ `data-organ-anchor="<key>"` داخل SVG بدن
//   • مقصد → لبهٔ نزدیکِ کارتِ `#organ-card-<key>`
//
// در چیدمان موبایل (وقتی کارت‌ها زیر بدن می‌آیند و افقی از هم جدا نیستند)
// هیچ فلشی رسم نمی‌شود.
// ─────────────────────────────────────────────────────────────────────────────

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
/** فاصلهٔ ریلِ عمودی از لبهٔ کارت — همان «شکستگیِ» طرحِ دستی */
const RAIL_INSET = 24;
/** فاصلهٔ ریل‌های هم‌جهت از هم، تا خط‌های عمودی روی هم نیفتند */
const RAIL_STEP = 13;
/** اگر اختلاف ارتفاع کمتر از این باشد، خط مستقیم کشیده می‌شود (شکستگی لازم نیست) */
const MIN_ELBOW_DROP = 14;
/** شعاع گِردیِ گوشه‌های شکستگی */
const CORNER = 9;
/** حداقل فاصلهٔ نقطهٔ ورودِ خط از لبهٔ بالا/پایینِ کارت */
const CARD_EDGE_INSET = 22;
/** حداقل فاصلهٔ افقی لازم تا خط اتصال معنا داشته باشد (چیدمان ستونی = بدون خط) */
const MIN_HORIZONTAL_GAP = 24;
/** مدت دنبال کردنِ انیمیشن‌های چیدمان بعد از هر تغییر */
const FOLLOW_MS = 900;
/** شعاع نقطهٔ توپر در انتهای خط (حالت عادی / فعال) */
const DOT_RADIUS = 3;
const DOT_RADIUS_ACTIVE = 4;

/**
 * مسیرِ «شکسته» از اندام تا کارت.
 *
 * از اندام افقی بیرون می‌آید، روی یک ریلِ عمودیِ نزدیک به کارت بالا/پایین
 * می‌رود و بعد افقی وارد کارت می‌شود — همان چیزی که در طرح دستی خواسته شده.
 * وقتی کارت تقریباً هم‌ارتفاعِ اندام است، شکستگی معنا ندارد و خط مستقیم می‌شود.
 */
function elbowPath(
  originX: number,
  originY: number,
  tipX: number,
  tipY: number,
  direction: 1 | -1,
  railInset: number,
): string {
  const drop = tipY - originY;
  if (Math.abs(drop) < MIN_ELBOW_DROP) {
    return `M ${originX} ${originY} L ${tipX} ${tipY}`;
  }

  // ریلِ عمودی کمی قبل از کارت؛ اگر جا نبود، وسطِ فاصله را ریل می‌کنیم.
  const available = Math.abs(tipX - originX);
  const inset = Math.min(railInset, available / 2);
  const railX = tipX - direction * inset;

  const radius = Math.min(CORNER, available / 2, Math.abs(drop) / 2);
  const vSign = Math.sign(drop);

  return [
    `M ${originX} ${originY}`,
    `L ${railX - direction * radius} ${originY}`,
    `Q ${railX} ${originY} ${railX} ${originY + vSign * radius}`,
    `L ${railX} ${tipY - vSign * radius}`,
    `Q ${railX} ${tipY} ${railX + direction * radius} ${tipY}`,
    `L ${tipX} ${tipY}`,
  ].join(' ');
}

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
    const raw: Omit<Connector, 'path'>[] = [];

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

      // کارت‌ها هم‌سطحِ اندامشان چیده می‌شوند، پس خط باید مستقیم و افقی به کارت
      // برسد. نقطهٔ ورود، هم‌ارتفاعِ خودِ اندام است و فقط وقتی از بدنهٔ کارت
      // بیرون بزند به نزدیک‌ترین لبه (با کمی فاصله) محدود می‌شود — همان‌جاست که
      // خط شکسته می‌شود.
      const cardTopY = cardRect.top - hostRect.top;
      const cardBottomY = cardTopY + cardRect.height;
      const inset = Math.min(CARD_EDGE_INSET, cardRect.height / 2);
      const tipY = Math.min(Math.max(originY, cardTopY + inset), cardBottomY - inset);

      raw.push({ key: target.key, color: target.color, tipX, tipY, direction, originX, originY });
    }

    // هر خطِ شکسته ریلِ عمودیِ خودش را می‌گیرد تا خط‌های یک سمت روی هم نیفتند؛
    // خط‌هایی که مسیر عمودی کوتاه‌تری دارند، ریلِ نزدیک‌تر به کارت را می‌گیرند.
    for (const direction of [1, -1] as const) {
      const sameSide = raw
        .filter((item) => item.direction === direction)
        .sort((a, b) => Math.abs(a.tipY - a.originY) - Math.abs(b.tipY - b.originY));

      sameSide.forEach((item, index) => {
        next.push({
          ...item,
          path: elbowPath(
            item.originX,
            item.originY,
            item.tipX,
            item.tipY,
            item.direction,
            RAIL_INSET + index * RAIL_STEP,
          ),
        });
      });
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
      className="pointer-events-none absolute inset-0 z-10 h-full w-full"
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
                strokeLinejoin="round"
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
