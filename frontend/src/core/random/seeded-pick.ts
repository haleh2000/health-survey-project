// src/core/random/seeded-pick.ts

/** FNV-1a 32-bit — پایدار، سریع، بدون وابستگی. */
export const hashString = (value: string): number => {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
};

/** همان seed همیشه همان آیتم را برمی‌گرداند. */
export const pickBySeed = <T>(items: readonly T[], seed: string): T | null =>
  items.length === 0 ? null : (items[hashString(seed) % items.length] ?? null);
