// src/modules/survey/infrastructure/storage/assessment-history.storage.ts

import { todayJalali, formatJalaliIso } from "@core/date/jalali";
import type { RiskAssessment } from "@survey/domain/entities/risk-assessment.entity";

/**
 * Local persistence for completed assessments.
 *
 * The backend is stateless — it scores a survey and forgets it — so the
 * dashboard's "what have I done so far" view is kept on the device. Records
 * are stored newest-first and capped so the payload stays small.
 */

export interface AssessmentRecord {
  readonly assessment: RiskAssessment;
  /** Jalali date of completion, ISO-formatted (`1404-05-24`). */
  readonly completedOnJalali: string;
  /** Epoch milliseconds, for ordering. */
  readonly completedAt: number;
  /** قد (سانتی‌متر) — برای تبدیل BMI به وزن در نمودار مقایسه‌ای. */
  readonly heightCm?: number;
  /** وزن (کیلوگرم) در زمان ارزیابی. */
  readonly weightKg?: number;
}

/** اندازه‌های بدنی که همراه ارزیابی ذخیره می‌شوند. */
export interface RecordedBodyMetrics {
  readonly heightCm: number;
  readonly weightKg: number;
}

const STORAGE_KEY = "health-assessment-history";
const MAX_RECORDS = 12;

export function loadAssessmentHistory(): AssessmentRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (record): record is AssessmentRecord =>
        typeof record === "object" &&
        record !== null &&
        "assessment" in record &&
        "completedAt" in record,
    );
  } catch {
    // Private browsing or corrupted payload — behave as "no history".
    return [];
  }
}

export function saveAssessmentRecord(
  assessment: RiskAssessment,
  body?: RecordedBodyMetrics | null,
): AssessmentRecord {
  const record: AssessmentRecord = {
    assessment,
    completedOnJalali: formatJalaliIso(todayJalali()),
    completedAt: Date.now(),
    ...(body ? { heightCm: body.heightCm, weightKg: body.weightKg } : {}),
  };

  try {
    const history = [record, ...loadAssessmentHistory()].slice(0, MAX_RECORDS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // Storage being unavailable must never break submission.
  }

  return record;
}

export const latestAssessmentRecord = (): AssessmentRecord | null =>
  loadAssessmentHistory()[0] ?? null;
