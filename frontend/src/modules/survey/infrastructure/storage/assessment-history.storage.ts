// src/modules/survey/infrastructure/storage/assessment-history.storage.ts

import {
  todayJalali,
  formatJalaliIso,
} from "@core/date/jalali";
import { toAsciiDigits } from "@core/text/digits";

import type { RiskAssessment } from "@survey/domain/entities/risk-assessment.entity";

/**
 * جنسیت ثبت‌شده
 */
export type RecordedSex = "male" | "female";

/**
 * یک رکورد ارزیابی ذخیره‌شده
 */
export interface AssessmentRecord {
  readonly assessment: RiskAssessment;

  /**
   * کد ملی شخصی که ارزیابی را انجام داده است.
   */
  readonly nationalId: string;

  /**
   * شناسه ارزیابی در دیتابیس بک‌اند.
   */
  readonly submissionId?: number;

  /**
   * تاریخ شمسی تکمیل ارزیابی.
   * مثال: 1404-05-24
   */
  readonly completedOnJalali: string;

  /**
   * زمان ثبت ارزیابی بر حسب timestamp.
   * برای مرتب‌سازی استفاده می‌شود.
   */
  readonly completedAt: number;

  /**
   * قد بر حسب سانتی‌متر
   */
  readonly heightCm?: number;

  /**
   * وزن بر حسب کیلوگرم
   */
  readonly weightKg?: number;

  /**
   * جنسیت
   */
  readonly sex?: RecordedSex;
}

/**
 * اندازه‌های بدنی
 */
export interface RecordedBodyMetrics {
  readonly heightCm: number;
  readonly weightKg: number;
}

const STORAGE_KEY = "health-assessment-history";
const LAST_RESULT_KEY = "health-survey-last-result";

const MAX_RECORDS = 12;

export const normalizeNationalId = (value: string): string =>
  toAsciiDigits(value).trim();

const isAssessmentRecord = (record: unknown): record is AssessmentRecord =>
  typeof record === "object" &&
  record !== null &&
  "assessment" in record &&
  "nationalId" in record &&
  typeof (record as AssessmentRecord).nationalId === "string" &&
  "completedOnJalali" in record &&
  typeof (record as AssessmentRecord).completedOnJalali === "string" &&
  "completedAt" in record &&
  typeof (record as AssessmentRecord).completedAt === "number";

const rememberLastResult = (record: AssessmentRecord): void => {
  try {
    localStorage.setItem(LAST_RESULT_KEY, JSON.stringify(record));
  } catch {
    // Ignore a full or blocked store.
  }
};

/**
 * آخرین نتیجهٔ محاسبه‌شده در همین مرورگر — برای باز کردن دوبارهٔ همان صفحهٔ نتیجه.
 */
export function loadLastResult(): AssessmentRecord | null {
  try {
    const raw = localStorage.getItem(LAST_RESULT_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isAssessmentRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * تمام سوابق ذخیره‌شده را برمی‌گرداند.
 */
export function loadAssessmentHistory(): AssessmentRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isAssessmentRecord);
  } catch {
    return [];
  }
}

/**
 * فقط سوابق مربوط به کد ملی مشخص‌شده را برمی‌گرداند.
 *
 * خروجی همیشه از جدیدترین ارزیابی به قدیمی‌ترین مرتب می‌شود.
 */
export function loadAssessmentHistoryByNationalId(
  nationalId: string,
): AssessmentRecord[] {
  const normalizedNationalId = normalizeNationalId(nationalId);

  if (!normalizedNationalId) {
    return [];
  }

  return loadAssessmentHistory()
    .filter(
      (record) =>
        normalizeNationalId(record.nationalId) === normalizedNationalId,
    )
    .sort((a, b) => b.completedAt - a.completedAt);
}

/**
 * آخرین نتیجهٔ قابل‌نمایش برای این کاربر.
 * اگر کد ملی نشست خالی باشد، همان آخرین نتیجهٔ ذخیره‌شده در مرورگر برمی‌گردد.
 */
export function resolveLatestAssessmentForUser(
  nationalId?: string | null,
): AssessmentRecord | null {
  const normalized = nationalId ? normalizeNationalId(nationalId) : "";
  const last = loadLastResult();

  if (last) {
    const lastId = normalizeNationalId(last.nationalId);
    if (!normalized || !lastId || lastId === normalized) {
      return last;
    }
  }

  if (normalized) {
    const matched = loadAssessmentHistoryByNationalId(normalized)[0];
    if (matched) return matched;
  }

  // Older saves may have an empty national id; still reopen the last local result.
  return latestAssessmentRecord();
}

/**
 * ذخیره یک ارزیابی جدید.
 */
export function saveAssessmentRecord(
  assessment: RiskAssessment,
  body?: RecordedBodyMetrics | null,
  sex?: RecordedSex | null,
  nationalId?: string | null,
): AssessmentRecord {
  const normalizedNationalId = nationalId
    ? normalizeNationalId(nationalId)
    : "";

  const record: AssessmentRecord = {
    assessment,

    nationalId: normalizedNationalId,

    completedOnJalali: formatJalaliIso(todayJalali()),

    completedAt: Date.now(),

    ...(body
      ? {
          heightCm: body.heightCm,
          weightKg: body.weightKg,
        }
      : {}),

    ...(sex
      ? {
          sex,
        }
      : {}),
  };

  try {
    const history = [record, ...loadAssessmentHistory()]
      .sort((a, b) => b.completedAt - a.completedAt)
      .slice(0, MAX_RECORDS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    rememberLastResult(record);
  } catch {
    // خطای localStorage نباید باعث شکست submit شود.
  }

  return record;
}

/**
 * آخرین ارزیابی ثبت‌شده.
 */
export const latestAssessmentRecord = (): AssessmentRecord | null =>
  loadAssessmentHistory().sort((a, b) => b.completedAt - a.completedAt)[0] ??
  null;
