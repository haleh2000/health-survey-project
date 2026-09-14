// src/modules/survey/infrastructure/storage/assessment-history.storage.ts

import {
  todayJalali,
  formatJalaliIso,
} from "@core/date/jalali";

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

const MAX_RECORDS = 12;

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

    return parsed.filter(
      (record): record is AssessmentRecord =>
        typeof record === "object" &&
        record !== null &&
        "assessment" in record &&
        "nationalId" in record &&
        typeof record.nationalId === "string" &&
        "completedOnJalali" in record &&
        typeof record.completedOnJalali === "string" &&
        "completedAt" in record &&
        typeof record.completedAt === "number",
    );
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
  const normalizedNationalId =
    nationalId.trim();

  if (!normalizedNationalId) {
    return [];
  }

  return loadAssessmentHistory()
    .filter(
      (record) =>
        record.nationalId ===
        normalizedNationalId,
    )
    .sort(
      (a, b) =>
        b.completedAt -
        a.completedAt,
    );
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
  const normalizedNationalId =
    nationalId?.trim() ?? "";

  const record: AssessmentRecord = {
    assessment,

    nationalId:
      normalizedNationalId,

    completedOnJalali:
      formatJalaliIso(
        todayJalali(),
      ),

    completedAt:
      Date.now(),

    ...(body
      ? {
          heightCm:
            body.heightCm,
          weightKg:
            body.weightKg,
        }
      : {}),

    ...(sex
      ? {
          sex,
        }
      : {}),
  };

  try {
    const history = [
      record,
      ...loadAssessmentHistory(),
    ]
      .sort(
        (a, b) =>
          b.completedAt -
          a.completedAt,
      )
      .slice(
        0,
        MAX_RECORDS,
      );

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(history),
    );
  } catch {
    // خطای localStorage نباید باعث شکست submit شود.
  }

  return record;
}

/**
 * آخرین ارزیابی ثبت‌شده.
 */
export const latestAssessmentRecord =
  (): AssessmentRecord | null =>
    loadAssessmentHistory()[0] ??
    null;

