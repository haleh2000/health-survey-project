// src/modules/survey/infrastructure/export/health-summary-pdf.service.ts
// ─────────────────────────────────────────────────────────────────────────────
// ساخت PDF از «خلاصهٔ سلامت».
//
// چرا از روی DOM عکس می‌گیریم و متن را مستقیم داخل PDF نمی‌نویسیم؟
// چون خروجی باید فارسیِ راست‌به‌چپ با فونتِ خودِ محصول باشد؛ jsPDF برای این کار
// به فونت embed‌شده و shaping دستی نیاز دارد. رندر همان چیزی که کاربر می‌بیند،
// هم دقیق‌تر است و هم با هر تغییر UI به‌روز می‌ماند.
//
// خروجی: A4 عمودی، چندصفحه‌ای (محتوای بلند به صفحات بعد سرریز می‌شود).
// ─────────────────────────────────────────────────────────────────────────────

import { domToCanvas } from "modern-screenshot";
import { jsPDF } from "jspdf";

/** اندازهٔ A4 بر حسب میلی‌متر. */
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
/** حاشیهٔ صفحه (میلی‌متر). */
const MARGIN_MM = 8;

export interface HealthSummaryPdfOptions {
  /** ناحیه‌ای از صفحه که باید در PDF بیاید. */
  readonly element: HTMLElement;
  /** نام فایل خروجی — بدون پسوند. */
  readonly fileName?: string;
  /** رنگ پس‌زمینهٔ صفحات PDF. */
  readonly background?: string;
}

export interface HealthSummaryPdfResult {
  readonly blob: Blob;
  readonly fileName: string;
}

/**
 * عناصری که نباید در PDF بیایند با `data-pdf-exclude` علامت‌گذاری می‌شوند
 * (مثلاً خودِ دکمه‌های دانلود و اشتراک‌گذاری).
 */
const isExcluded = (node: Node): boolean =>
  node instanceof HTMLElement && node.hasAttribute("data-pdf-exclude");

/** رنگ پس‌زمینهٔ مؤثرِ صفحه — تا PDF در تم تیره هم خوانا بماند. */
function resolveBackground(explicit?: string): string {
  if (explicit) return explicit;
  const bodyBg = getComputedStyle(document.body).backgroundColor;
  return bodyBg && bodyBg !== "rgba(0, 0, 0, 0)" ? bodyBg : "#ffffff";
}

/** PDF را می‌سازد و به‌صورت Blob برمی‌گرداند (بدون ذخیره روی دیسک). */
export async function buildHealthSummaryPdf({
  element,
  fileName = "health-summary",
  background,
}: HealthSummaryPdfOptions): Promise<HealthSummaryPdfResult> {
  const canvas = await domToCanvas(element, {
    scale: Math.min(window.devicePixelRatio || 1, 2),
    backgroundColor: resolveBackground(background),
    filter: (node) => !isExcluded(node),
  });

  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

  const contentWidthMm = A4_WIDTH_MM - MARGIN_MM * 2;
  const contentHeightMm = A4_HEIGHT_MM - MARGIN_MM * 2;
  /** پیکسل‌های تصویر به ازای هر میلی‌متر روی کاغذ */
  const pxPerMm = canvas.width / contentWidthMm;
  /** ارتفاعِ برشِ هر صفحه، بر حسب پیکسلِ تصویر */
  const pageSliceHeightPx = Math.floor(contentHeightMm * pxPerMm);

  const slice = document.createElement("canvas");
  const sliceContext = slice.getContext("2d");
  if (!sliceContext) throw new Error("امکان ساخت بوم برای PDF وجود ندارد.");

  let offsetY = 0;
  let pageIndex = 0;

  while (offsetY < canvas.height) {
    const sliceHeightPx = Math.min(pageSliceHeightPx, canvas.height - offsetY);

    slice.width = canvas.width;
    slice.height = sliceHeightPx;
    sliceContext.fillStyle = resolveBackground(background);
    sliceContext.fillRect(0, 0, slice.width, slice.height);
    sliceContext.drawImage(
      canvas,
      0, offsetY, canvas.width, sliceHeightPx,
      0, 0, canvas.width, sliceHeightPx,
    );

    if (pageIndex > 0) pdf.addPage();
    pdf.addImage(
      slice.toDataURL("image/jpeg", 0.92),
      "JPEG",
      MARGIN_MM,
      MARGIN_MM,
      contentWidthMm,
      sliceHeightPx / pxPerMm,
      undefined,
      "FAST",
    );

    offsetY += sliceHeightPx;
    pageIndex += 1;
  }

  return { blob: pdf.output("blob"), fileName: `${fileName}.pdf` };
}

/** PDF را می‌سازد و بلافاصله دانلود می‌کند. */
export async function downloadHealthSummaryPdf(
  options: HealthSummaryPdfOptions,
): Promise<HealthSummaryPdfResult> {
  const result = await buildHealthSummaryPdf(options);

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
