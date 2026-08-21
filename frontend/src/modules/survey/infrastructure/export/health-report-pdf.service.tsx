// src/modules/survey/infrastructure/export/health-report-pdf.service.tsx
// ─────────────────────────────────────────────────────────────────────────────
// ساختِ «گزارش سلامت» به‌صورت PDF چندصفحه‌ای A4.
//
// سند از خودِ داشبورد عکس گرفته نمی‌شود؛ یک سندِ اختصاصی
// (`HealthReportDocument`) خارج از دید کاربر رندر می‌شود که:
//   • همهٔ محتوا را دارد (از جمله متنِ کاملِ استوری‌ها که در UI پشت کلیک است)
//   • عناصر تعاملی (دکمه‌ها، «مشاهده ارزیابی من»، فلش‌ها) را ندارد
//   • خودش صفحه‌بندی می‌کند، پس هیچ کارتی بین دو صفحه نصف نمی‌شود
//
// از هر صفحهٔ آمادهٔ سند یک تصویر گرفته و دقیقاً روی یک برگ A4 نشانده می‌شود.
// (متنِ فارسی به‌صورت تصویر می‌آید؛ jsPDF برای متنِ راست‌به‌چپ به فونت embed و
// shaping دستی نیاز دارد که خروجی‌اش شکسته و نامطمئن است.)
// ─────────────────────────────────────────────────────────────────────────────

import { jsPDF } from "jspdf";
import { domToCanvas } from "modern-screenshot";
import { createElement } from "react";
import { createRoot, type Root } from "react-dom/client";

import type { AssessmentRecord } from "@survey/infrastructure/storage/assessment-history.storage";
import {
  HealthReportDocument,
  REPORT_PAGE_SELECTOR,
} from "@survey/presentation/components/report/HealthReportDocument";
import { buildReportBlocks } from "@survey/presentation/components/report/report-content";
import {
  PAGE_HEIGHT_MM,
  PAGE_HEIGHT_PX,
  PAGE_WIDTH_MM,
  PAGE_WIDTH_PX,
} from "@survey/presentation/components/report/report-theme";

/** چگالی عکس‌برداری؛ ۲ برابر یعنی حدود ۱۹۲dpi روی کاغذ. */
const CAPTURE_SCALE = 2;
/** کیفیت JPEG صفحات — تعادل بین خوانایی متن و حجم فایل. */
const JPEG_QUALITY = 0.92;
/** اگر رندر سند به هر دلیلی گیر کرد، ساخت PDF نباید برای همیشه معلق بماند. */
const RENDER_TIMEOUT_MS = 30_000;

export interface HealthReportPdfOptions {
  readonly record: AssessmentRecord | null;
  readonly history: readonly AssessmentRecord[];
  /** نام فایل خروجی — بدون پسوند. */
  readonly fileName?: string;
}

export interface HealthReportPdfResult {
  readonly blob: Blob;
  readonly fileName: string;
  readonly pageCount: number;
}

/** ظرفِ خارج از دید که سند در آن رندر می‌شود. */
function createOffscreenHost(): HTMLDivElement {
  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.style.cssText = [
    "position:fixed",
    "top:0",
    `left:-${PAGE_WIDTH_PX * 2}px`,
    `width:${PAGE_WIDTH_PX}px`,
    "background:#ffffff",
    "pointer-events:none",
    "z-index:-1",
    "contain:layout style",
  ].join(";");
  document.body.appendChild(host);
  return host;
}

/** سند را رندر می‌کند و تا آمادهٔ عکس‌برداری شدن صبر می‌کند. */
async function renderDocument(
  host: HTMLElement,
  options: HealthReportPdfOptions,
): Promise<Root> {
  const { blocks, meta } = buildReportBlocks(options.record, options.history);
  const root = createRoot(host);

  await new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(
      () => reject(new Error("رندر سند PDF بیش از حد طول کشید.")),
      RENDER_TIMEOUT_MS,
    );

    root.render(
      createElement(HealthReportDocument, {
        blocks,
        meta,
        onReady: () => {
          window.clearTimeout(timer);
          resolve();
        },
      }),
    );
  });

  return root;
}

/** PDF را می‌سازد و به‌صورت Blob برمی‌گرداند (بدون ذخیره روی دیسک). */
export async function buildHealthReportPdf(
  options: HealthReportPdfOptions,
): Promise<HealthReportPdfResult> {
  const host = createOffscreenHost();
  let root: Root | null = null;

  try {
    root = await renderDocument(host, options);

    const pages = Array.from(host.querySelectorAll<HTMLElement>(REPORT_PAGE_SELECTOR));
    if (pages.length === 0) throw new Error("سند PDF هیچ صفحه‌ای تولید نکرد.");

    const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

    for (const [index, page] of pages.entries()) {
      const canvas = await domToCanvas(page, {
        scale: CAPTURE_SCALE,
        width: PAGE_WIDTH_PX,
        height: PAGE_HEIGHT_PX,
        backgroundColor: "#ffffff",
      });

      if (index > 0) pdf.addPage();
      pdf.addImage(
        canvas.toDataURL("image/jpeg", JPEG_QUALITY),
        "JPEG",
        0,
        0,
        PAGE_WIDTH_MM,
        PAGE_HEIGHT_MM,
        `page-${index}`,
        "FAST",
      );
    }

    return {
      blob: pdf.output("blob"),
      fileName: `${options.fileName ?? "health-report"}.pdf`,
      pageCount: pages.length,
    };
  } finally {
    // unmount باید بعد از پایانِ کار باشد؛ وگرنه صفحات پیش از عکس‌برداری حذف می‌شوند.
    root?.unmount();
    host.remove();
  }
}

/** PDF را می‌سازد و بلافاصله دانلود می‌کند. */
export async function downloadHealthReportPdf(
  options: HealthReportPdfOptions,
): Promise<HealthReportPdfResult> {
  const result = await buildHealthReportPdf(options);

  const url = URL.createObjectURL(result.blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = result.fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // آزادسازی بعد از شروع دانلود؛ فوری revoke کردن در بعضی مرورگرها دانلود را می‌شکند.
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);

  return result;
}
