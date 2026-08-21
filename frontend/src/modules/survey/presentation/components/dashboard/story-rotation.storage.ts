// src/modules/survey/presentation/components/dashboard/story-rotation.storage.ts
// ─────────────────────────────────────────────────────────────────────────────
// نشانگرِ چرخشِ استوری‌ها.
//
// هر بار که کاربر یک دستهٔ استوری را باز می‌کند فقط دو اسلاید می‌بیند؛ برای
// اینکه دفعهٔ بعد دو اسلاید *دیگر* ببیند، محلِ توقف روی دستگاه ذخیره می‌شود.
// نقطهٔ شروعِ اولین بار برای هر کاربر تصادفی است تا دو کاربرِ هم‌گروه هم لزوماً
// یک جفت استوریِ یکسان نبینند.
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = "health-story-rotation";

type Cursors = Record<string, number>;

function readCursors(): Cursors {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};
    return parsed as Cursors;
  } catch {
    // مرور خصوصی یا دادهٔ خراب — مثل «هیچ سابقه‌ای نیست» رفتار کن.
    return {};
  }
}

function writeCursors(cursors: Cursors): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cursors));
  } catch {
    // ذخیره‌سازی در دسترس نیست؛ چرخش فقط تا پایان همین نشست کار می‌کند.
  }
}

/** نشانگرهای درون‌حافظه‌ای — وقتی localStorage در دسترس نیست هم چرخش کار کند. */
const memoryCursors: Cursors = {};

/**
 * شمارهٔ اولین اسلایدِ این دفعه را برمی‌گرداند و نشانگر را برای دفعهٔ بعد جلو می‌برد.
 *
 * @param bucket   شناسهٔ یکتای «گروه ریسک + دسته»
 * @param total    تعداد کل اسلایدهای آن دسته
 * @param stride   تعداد اسلایدی که این دفعه نمایش داده می‌شود
 */
export function nextRotationOffset(bucket: string, total: number, stride: number): number {
  if (total <= 0) return 0;

  const stored = readCursors();
  const current = stored[bucket] ?? memoryCursors[bucket];

  // اولین بار: از یک نقطهٔ تصادفی شروع کن تا کاربرهای مختلف هم‌شروع نباشند.
  const offset = typeof current === "number" ? current % total : Math.floor(Math.random() * total);

  const next = (offset + stride) % total;
  memoryCursors[bucket] = next;
  writeCursors({ ...stored, [bucket]: next });

  return offset;
}
