// src/modules/survey/presentation/components/report/HealthReportDocument.tsx
// ─────────────────────────────────────────────────────────────────────────────
// سندِ A4 با صفحه‌بندی واقعی.
//
// چرا: عکس گرفتن از خودِ داشبورد و بریدنِ تصویر به اندازهٔ A4، محتوا را از وسط
// نصف می‌کند و هرچه روی صفحه پنهان است (متن استوری‌ها، کارت‌های بسته) اصلاً در
// خروجی نمی‌آید. اینجا برعکس عمل می‌کنیم: محتوا به «بلوک»های تقسیم‌ناپذیر
// شکسته می‌شود، ارتفاع واقعی هر بلوک اندازه‌گیری می‌شود و بعد بلوک‌ها بین
// صفحات پخش می‌شوند — پس هیچ بلوکی بین دو صفحه نصف نمی‌شود.
//
// مراحل رندر:
//   ۱) measure — همهٔ بلوک‌ها در ستونی به پهنای محتوا رندر و ارتفاعشان خوانده می‌شود
//   ۲) paginate — بلوک‌ها حریصانه در صفحات چیده می‌شوند
//   ۳) ready   — بعد از آماده شدن فونت‌ها و تصویرها، `onReady` صدا زده می‌شود
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { toPersianDigits } from "@core/text/digits";

import type { ReportBlock, ReportMeta } from "./report-content";
import {
  BLOCK_GAP,
  C,
  CONTENT_HEIGHT,
  CONTENT_WIDTH,
  FOOTER_HEIGHT,
  HEADER_HEIGHT,
  PAGE_HEIGHT_PX,
  PAGE_PADDING_BOTTOM,
  PAGE_PADDING_TOP,
  PAGE_PADDING_X,
  PAGE_WIDTH_PX,
  REPORT_FONT_STACK,
} from "./report-theme";

interface PlacedBlock {
  readonly block: ReportBlock;
  /** اگر بلوک از یک صفحه بلندتر باشد، کوچک می‌شود تا بریده نشود. */
  readonly scale: number;
}

interface ReportPage {
  readonly kind: "cover" | "content";
  readonly items: readonly PlacedBlock[];
}

interface Props {
  readonly blocks: readonly ReportBlock[];
  readonly meta: ReportMeta;
  /** وقتی صفحه‌بندی تمام و همهٔ دارایی‌ها لود شد. */
  readonly onReady?: () => void;
}

/** صفت صفحات؛ سرویس PDF با همین انتخابگر صفحات را پیدا می‌کند. */
export const REPORT_PAGE_SELECTOR = "[data-report-page]";

/** منتظر ماندن تا فونت‌ها، تصویرها و یک فریمِ رنگ‌آمیزی آماده شوند. */
export async function waitForReportAssets(root: HTMLElement): Promise<void> {
  try {
    await document.fonts?.ready;
  } catch {
    // نبودِ Font Loading API نباید ساختِ PDF را متوقف کند.
  }

  const sources = new Set<string>();
  root.querySelectorAll("img").forEach((img) => sources.add(img.src));
  root.querySelectorAll("image").forEach((node) => {
    const href = node.getAttribute("href") ?? node.getAttribute("xlink:href");
    if (href) sources.add(new URL(href, window.location.href).href);
  });

  await Promise.all(
    Array.from(sources).map(
      (src) =>
        new Promise<void>((resolve) => {
          const probe = new Image();
          probe.onload = () => resolve();
          probe.onerror = () => resolve();
          probe.src = src;
        }),
    ),
  );

  await new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );
}

/** چیدن بلوک‌ها در صفحات، بدون بریدنِ هیچ بلوکی. */
function paginate(
  blocks: readonly ReportBlock[],
  heights: ReadonlyMap<string, number>,
): readonly ReportPage[] {
  const pages: ReportPage[] = [];
  let current: PlacedBlock[] = [];
  let used = 0;

  const flush = () => {
    if (current.length > 0) {
      pages.push({ kind: "content", items: current });
      current = [];
      used = 0;
    }
  };

  const heightOf = (block: ReportBlock) => heights.get(block.id) ?? 0;

  blocks.forEach((block, index) => {
    if (block.fullPage) {
      flush();
      pages.push({ kind: "cover", items: [{ block, scale: 1 }] });
      return;
    }

    if (block.breakBefore) flush();

    const raw = heightOf(block);
    const gap = current.length > 0 ? BLOCK_GAP : 0;

    // بلوکی که از یک صفحهٔ کامل هم بلندتر است: تنها روی صفحهٔ خودش و کمی کوچک‌تر.
    if (raw > CONTENT_HEIGHT) {
      flush();
      pages.push({ kind: "content", items: [{ block, scale: CONTENT_HEIGHT / raw }] });
      return;
    }

    if (used + gap + raw > CONTENT_HEIGHT) flush();

    // عنوان بخش نباید تنها ته صفحه بماند.
    const next = blocks[index + 1];
    if (block.keepWithNext && next && !next.fullPage) {
      const needed = (current.length > 0 ? BLOCK_GAP : 0) + raw + BLOCK_GAP + heightOf(next);
      if (used + needed > CONTENT_HEIGHT && used > 0) flush();
    }

    current.push({ block, scale: 1 });
    used += (current.length > 1 ? BLOCK_GAP : 0) + raw;
  });

  flush();
  return pages;
}

export function HealthReportDocument({ blocks, meta, onReady }: Props) {
  const measureRef = useRef<HTMLDivElement | null>(null);
  const pagesRef = useRef<HTMLDivElement | null>(null);
  const [pages, setPages] = useState<readonly ReportPage[] | null>(null);

  // ۱) اندازه‌گیری
  useLayoutEffect(() => {
    let cancelled = false;
    const host = measureRef.current;
    if (!host) return;

    void (async () => {
      await waitForReportAssets(host);
      if (cancelled) return;

      const heights = new Map<string, number>();
      host.querySelectorAll<HTMLElement>("[data-measure-id]").forEach((node) => {
        heights.set(node.dataset.measureId ?? "", Math.ceil(node.getBoundingClientRect().height));
      });
      setPages(paginate(blocks, heights));
    })();

    return () => {
      cancelled = true;
    };
  }, [blocks]);

  // ۲) اعلام آمادگی بعد از رندر صفحات
  useEffect(() => {
    if (!pages || !onReady) return;
    let cancelled = false;
    const host = pagesRef.current;
    if (!host) return;

    void (async () => {
      await waitForReportAssets(host);
      if (!cancelled) onReady();
    })();

    return () => {
      cancelled = true;
    };
  }, [pages, onReady]);

  const total = pages?.length ?? 0;

  return (
    <div
      dir="rtl"
      lang="fa"
      style={{
        fontFamily: REPORT_FONT_STACK,
        color: C.ink,
        background: C.surface,
        width: PAGE_WIDTH_PX,
      }}
    >
      {/* ستون اندازه‌گیری — تا وقتی صفحه‌بندی تمام نشده روی صفحه است، بعد حذف می‌شود */}
      {!pages && (
        <div ref={measureRef} style={{ width: CONTENT_WIDTH, padding: 0 }} aria-hidden>
          {blocks
            .filter((block) => !block.fullPage)
            .map((block) => (
              <div key={block.id} data-measure-id={block.id} style={{ marginBottom: BLOCK_GAP }}>
                {block.node}
              </div>
            ))}
        </div>
      )}

      {pages && (
        <div ref={pagesRef}>
          {pages.map((page, pageIndex) => (
            <Page key={pageIndex} page={page} index={pageIndex} total={total} meta={meta} />
          ))}
        </div>
      )}
    </div>
  );
}

function Page({
  page,
  index,
  total,
  meta,
}: {
  readonly page: ReportPage;
  readonly index: number;
  readonly total: number;
  readonly meta: ReportMeta;
}) {
  const isCover = page.kind === "cover";

  return (
    <div
      data-report-page
      style={{
        width: PAGE_WIDTH_PX,
        height: PAGE_HEIGHT_PX,
        background: C.surface,
        boxSizing: "border-box",
        padding: `${PAGE_PADDING_TOP}px ${PAGE_PADDING_X}px ${PAGE_PADDING_BOTTOM}px`,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {!isCover && (
        <div
          style={{
            height: HEADER_HEIGHT,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: `1px solid ${C.line}`,
            marginBottom: 10,
            boxSizing: "border-box",
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 800, color: C.brandDark }}>
            {meta.title} — {meta.personName}
          </span>
          <span style={{ fontSize: 10.5, color: C.inkSubtle }}>{meta.dateLabel}</span>
        </div>
      )}

      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          gap: BLOCK_GAP,
          alignItems: "stretch",
        }}
      >
        {page.items.map(({ block, scale }) => (
          <div
            key={block.id}
            style={
              isCover
                ? { flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }
                : scale === 1
                ? { flexShrink: 0 }
                : { flexShrink: 0, transform: `scale(${scale})`, transformOrigin: "top right", width: "100%" }
            }
          >
            {block.node}
          </div>
        ))}
      </div>

      {!isCover && (
        <div
          style={{
            height: FOOTER_HEIGHT,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: `1px solid ${C.line}`,
            marginTop: 10,
            boxSizing: "border-box",
            fontSize: 10,
            color: C.inkSubtle,
          }}
        >
          <span>این گزارش جایگزین تشخیص پزشک نیست.</span>
          <span>
            صفحهٔ {toPersianDigits(index + 1)} از {toPersianDigits(total)}
          </span>
        </div>
      )}
    </div>
  );
}
