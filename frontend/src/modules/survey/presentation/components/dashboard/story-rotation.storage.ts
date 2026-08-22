// src/modules/survey/presentation/components/dashboard/story-rotation.storage.ts
// ─────────────────────────────────────────────────────────────────────────────
// انتخابِ ثابتِ استوری برای هر کاربر.
//
// هر دستگاه/کاربر یک «بذرِ» تصادفی می‌گیرد که یک‌بار ساخته و ذخیره می‌شود؛
// از روی همان بذر، نقطهٔ شروعِ هر دسته به‌صورت قطعی حساب می‌شود. نتیجه:
// دو کاربرِ هم‌گروه استوری‌های متفاوتی می‌بینند، ولی یک کاربر با رفرشِ صفحه یا
// باز کردنِ دوبارهٔ همان دسته، همیشه همان استوری‌ها را می‌بیند.
// ─────────────────────────────────────────────────────────────────────────────

const SEED_KEY = "health-story-seed";

/** بذرِ درون‌حافظه‌ای — وقتی localStorage در دسترس نیست، دستِ‌کم در همین نشست ثابت بماند. */
let memorySeed: string | null = null;

function createSeed(): string {
  return `${Math.floor(Math.random() * 2 ** 32).toString(36)}-${Math.floor(Math.random() * 2 ** 32).toString(36)}`;
}

/** بذرِ یکتای این کاربر؛ اولین بار ساخته و ذخیره می‌شود. */
function userSeed(): string {
  if (memorySeed) return memorySeed;

  try {
    const stored = localStorage.getItem(SEED_KEY);

    if (stored) {
      memorySeed = stored;
      return stored;
    }

    const fresh = createSeed();
    localStorage.setItem(SEED_KEY, fresh);
    memorySeed = fresh;
    return fresh;
  } catch {
    // مرور خصوصی یا ذخیره‌سازیِ غیرفعال — بذر فقط تا پایان همین نشست می‌ماند.
    memorySeed = createSeed();
    return memorySeed;
  }
}

/** هشِ ساده و پایدار (FNV-1a) برای تبدیلِ «بذر + دسته» به یک عدد. */
function hash(value: string): number {
  let result = 0x811c9dc5;

  for (let i = 0; i < value.length; i += 1) {
    result ^= value.charCodeAt(i);
    result = Math.imul(result, 0x01000193);
  }

  return result >>> 0;
}

/**
 * شمارهٔ اولین اسلایدِ این کاربر برای یک دسته — همیشه ثابت.
 *
 * @param bucket شناسهٔ یکتای «گروه ریسک + دسته»
 * @param total  تعداد کل اسلایدهای آن دسته
 */
export function stableStoryOffset(bucket: string, total: number): number {
  if (total <= 0) return 0;

  return hash(`${userSeed()}:${bucket}`) % total;
}
