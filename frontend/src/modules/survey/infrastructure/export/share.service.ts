// src/modules/survey/infrastructure/export/share.service.ts
// ─────────────────────────────────────────────────────────────────────────────
// اشتراک‌گذاری «خلاصهٔ سلامت».
//
// مسیر اول همیشه Web Share API است (روی موبایل، شیتِ بومیِ سیستم باز می‌شود و
// کاربر هر اپلیکیشنی را که دارد انتخاب می‌کند). اگر مرورگر پشتیبانی نکرد،
// لینک‌های مستقیم شبکه‌های اجتماعی و «کپی لینک» به‌عنوان جایگزین ارائه می‌شود.
// ─────────────────────────────────────────────────────────────────────────────

export interface SharePayload {
  readonly title: string;
  readonly text: string;
  readonly url: string;
  /** در صورت وجود، فایل PDF هم همراه اشتراک‌گذاری فرستاده می‌شود. */
  readonly file?: File;
}

export type ShareOutcome = "shared" | "cancelled" | "unsupported";

const canShareFiles = (file: File): boolean =>
  typeof navigator.canShare === "function" && navigator.canShare({ files: [file] });

/** تلاش برای اشتراک‌گذاری بومی. */
export async function shareNatively(payload: SharePayload): Promise<ShareOutcome> {
  if (typeof navigator.share !== "function") return "unsupported";

  const data: ShareData = {
    title: payload.title,
    text: payload.text,
    url: payload.url,
  };

  if (payload.file && canShareFiles(payload.file)) {
    // وقتی فایل فرستاده می‌شود، بعضی پلتفرم‌ها url را نادیده می‌گیرند.
    data.files = [payload.file];
  }

  try {
    await navigator.share(data);
    return "shared";
  } catch (error) {
    // انصرافِ کاربر خطا نیست.
    if (error instanceof DOMException && error.name === "AbortError") return "cancelled";
    return "unsupported";
  }
}

export interface ShareTarget {
  readonly key: string;
  readonly label: string;
  readonly href: string;
}

/** لینک‌های اشتراک‌گذاری برای مرورگرهایی که Web Share ندارند (عمدتاً دسکتاپ). */
export function shareTargetsFor({ text, url }: Pick<SharePayload, "text" | "url">): readonly ShareTarget[] {
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(url);

  return [
    { key: "telegram", label: "تلگرام", href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}` },
    { key: "whatsapp", label: "واتساپ", href: `https://wa.me/?text=${encodedText}%20${encodedUrl}` },
    { key: "x", label: "ایکس (توییتر)", href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}` },
    { key: "linkedin", label: "لینکدین", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
    { key: "email", label: "ایمیل", href: `mailto:?subject=${encodeURIComponent("خلاصه سلامت من")}&body=${encodedText}%20${encodedUrl}` },
  ];
}

/** کپی لینک در کلیپ‌بورد؛ با جایگزین برای مرورگرهای قدیمی. */
export async function copyLink(url: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      return true;
    }
  } catch {
    // به روش جایگزین ادامه بده.
  }

  try {
    const input = document.createElement("textarea");
    input.value = url;
    input.setAttribute("readonly", "true");
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.select();
    const copied = document.execCommand("copy");
    input.remove();
    return copied;
  } catch {
    return false;
  }
}
