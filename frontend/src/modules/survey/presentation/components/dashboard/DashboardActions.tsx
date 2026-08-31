// src/modules/survey/presentation/components/dashboard/DashboardActions.tsx
// دو دکمهٔ پایانِ داشبورد: «دانلود PDF» و «اشتراک‌گذاری».
//
// دانلود: از داشبورد عکس گرفته نمی‌شود؛ سندِ اختصاصیِ گزارش ساخته می‌شود که
// همهٔ محتوا (از جمله متنِ استوری‌ها) را در قالب استاندارد A4 و بدون بریدنِ
// عناصر می‌چیند. اشتراک‌گذاری: اول شیتِ بومیِ سیستم؛ اگر نبود، لیست شبکه‌های
// اجتماعی و «کپی لینک».

import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Download, Link2, Share2, X } from "lucide-react";
import { useState } from "react";

import {
  buildHealthReportPdf,
  downloadHealthReportPdf,
} from "@survey/infrastructure/export/health-report-pdf.service";
import type { AssessmentRecord } from "@survey/infrastructure/storage/assessment-history.storage";
import {
  copyLink,
  shareNatively,
  shareTargetsFor,
} from "@survey/infrastructure/export/share.service";

interface Props {
  /** آخرین ارزیابی — محتوای گزارش از همین ساخته می‌شود. */
  readonly record: AssessmentRecord | null;
  /** سوابق قبلی — برای شمارش ارزیابی‌ها در جلد گزارش. */
  readonly history: readonly AssessmentRecord[];
  /** نام کاربر — برای عنوان فایل و متن اشتراک‌گذاری. */
  readonly personName?: string | null;
}

const SHARE_TITLE = "خلاصه سلامت من";
const SHARE_TEXT = "خلاصهٔ وضعیت سلامتم را در «دی‌دار» ببین — نقشه اندام‌ها، شاخص توده بدنی و پیشنهادهای روزانه.";

export function DashboardActions({ record, history, personName }: Props) {
  const [busy, setBusy] = useState<"pdf" | "share" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fallbackOpen, setFallbackOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const pageUrl = typeof window !== "undefined" ? window.location.href : "";
  const fileBase = personName ? `health-report-${personName.replace(/\s+/g, "-")}` : "health-report";

  const handleDownload = async () => {
    if (busy) return;

    setBusy("pdf");
    setError(null);
    try {
      await downloadHealthReportPdf({ record, history, fileName: fileBase });
    } catch {
      setError("ساخت PDF ناموفق بود. لطفاً دوباره تلاش کنید.");
    } finally {
      setBusy(null);
    }
  };

  const handleShare = async () => {
    if (busy) return;
    setBusy("share");
    setError(null);

    try {
      // اگر بشود، خودِ PDF هم همراه اشتراک‌گذاری فرستاده می‌شود.
      let file: File | undefined;
      if (typeof navigator.canShare === "function") {
        try {
          const pdf = await buildHealthReportPdf({ record, history, fileName: fileBase });
          file = new File([pdf.blob], pdf.fileName, { type: "application/pdf" });
        } catch {
          // بدون فایل هم اشتراک‌گذاری معنا دارد.
        }
      }

      const outcome = await shareNatively({
        title: SHARE_TITLE,
        text: SHARE_TEXT,
        url: pageUrl,
        file,
      });

      if (outcome === "unsupported") setFallbackOpen(true);
    } finally {
      setBusy(null);
    }
  };

  const handleCopy = async () => {
    const ok = await copyLink(pageUrl);
    setCopied(ok);
    if (ok) window.setTimeout(() => setCopied(false), 2_000);
  };

  return (
    <div data-pdf-exclude className="flex flex-col items-center gap-3">
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={handleDownload}
          disabled={busy !== null}
          className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl
                     bg-gradient-to-r from-[#0fadb6] to-[#0a8a92] px-6 text-sm font-black text-white
                     shadow-[0_14px_30px_rgba(17,164,184,0.22)] transition hover:-translate-y-0.5
                     disabled:pointer-events-none disabled:opacity-60"
        >
          <Download className="h-4 w-4" />
          {busy === "pdf" ? "در حال ساخت PDF…" : "دانلود PDF"}
        </button>

        <button
          type="button"
          onClick={handleShare}
          disabled={busy !== null}
          className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl
                     border border-day-primary/40 bg-day-primary/5 px-6 text-sm font-black text-day-primary
                     transition hover:bg-day-primary/10 disabled:pointer-events-none disabled:opacity-60"
        >
          <Share2 className="h-4 w-4" />
          {busy === "share" ? "در حال آماده‌سازی…" : "اشتراک‌گذاری"}
        </button>
      </div>

      <p className="text-[11px] text-ink-subtle">
        فایل PDF شامل مشخصات، نقشه سلامت اندام‌ها، شاخص توده بدنی و متنِ کاملِ پیشنهادهای روزانه است.
      </p>

      {error && <p className="text-[11px] font-bold text-risk-critical">{error}</p>}

      {/* جایگزینِ دسکتاپ: انتخاب شبکهٔ اجتماعی */}
      <AnimatePresence>
        {fallbackOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] grid place-items-center bg-black/60 p-5 backdrop-blur-sm"
            onClick={(event) => {
              if (event.target === event.currentTarget) setFallbackOpen(false);
            }}
          >
            <motion.div
              dir="rtl"
              role="dialog"
              aria-modal="true"
              aria-label="اشتراک‌گذاری خلاصه سلامت"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              className="w-full max-w-sm rounded-3xl border border-line bg-surface p-5 shadow-card"
            >
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-sm font-black text-ink">اشتراک‌گذاری در…</h4>
                <button
                  type="button"
                  onClick={() => setFallbackOpen(false)}
                  aria-label="بستن"
                  className="cursor-pointer rounded-lg p-1 text-ink-subtle transition hover:bg-surface-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <ul className="flex flex-col gap-2">
                {shareTargetsFor({ text: SHARE_TEXT, url: pageUrl }).map((target) => (
                  <li key={target.key}>
                    <a
                      href={target.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="flex items-center justify-between rounded-xl border border-line px-3 py-2.5
                                 text-xs font-bold text-ink transition hover:border-day-primary/40 hover:bg-day-primary/5"
                    >
                      {target.label}
                      <Link2 className="h-3.5 w-3.5 text-ink-subtle" />
                    </a>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={handleCopy}
                className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl
                           bg-surface-muted px-3 py-2.5 text-xs font-bold text-ink-muted transition
                           hover:bg-day-primary/10 hover:text-day-primary"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "لینک کپی شد" : "کپی لینک صفحه"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
