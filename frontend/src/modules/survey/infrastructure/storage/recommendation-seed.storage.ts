// src/modules/survey/infrastructure/storage/recommendation-seed.storage.ts

const SEED_KEY = "daydar-recommendation-seed";

/** وقتی شناسه ارزیابی نداریم، یک seed پایدار برای همین مرورگر می‌سازیم. */
export const readOrCreateRecommendationSeed = (): string => {
  try {
    const existing = localStorage.getItem(SEED_KEY);
    if (existing) return existing;

    const created = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(SEED_KEY, created);
    return created;
  } catch {
    return "fallback-seed";
  }
};

export const resetRecommendationSeed = (): void => {
  try {
    localStorage.removeItem(SEED_KEY);
  } catch {
    /* حالت private mode را نادیده بگیر */
  }
};
