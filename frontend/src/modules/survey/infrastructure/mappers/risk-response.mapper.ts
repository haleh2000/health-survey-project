import { serverError, type AppError } from "@core/errors/app-error";
import { err, ok, type Result } from "@core/result/result";

import {
  RiskTier,
  type RiskAssessment,
} from "@survey/domain/entities/risk-assessment.entity";
import {
  RESPONSE_FIELD_ALIAS,
  RISK_LEVEL_LABEL,
} from "@survey/infrastructure/contract/backend-contract";
import type { RiskResponseDto } from "@survey/infrastructure/dto/survey.dto";

/**
 * Turns the Persian-keyed response into a `RiskAssessment`.
 *
 * The label is the authoritative signal because `processing.py` short-circuits
 * to the critical tier on any cancer or stroke history regardless of score —
 * so classifying by score alone would silently downgrade those results. Score
 * thresholds are only the fallback for an unrecognised label.
 */

const LABEL_TO_TIER: ReadonlyMap<string, RiskTier> = new Map([
  [RISK_LEVEL_LABEL.low, RiskTier.Low],
  [RISK_LEVEL_LABEL.moderate, RiskTier.Moderate],
  [RISK_LEVEL_LABEL.elevated, RiskTier.Elevated],
  [RISK_LEVEL_LABEL.critical, RiskTier.Critical],
]);

/** Mirrors the cut-offs in `processing.py`, used only if the label is unknown. */
const tierFromScore = (score: number): RiskTier => {
  if (score <= 5) return RiskTier.Low;
  if (score <= 10) return RiskTier.Moderate;
  if (score <= 16) return RiskTier.Elevated;
  return RiskTier.Critical;
};

const classify = (label: string, score: number): RiskTier =>
  LABEL_TO_TIER.get(label.trim()) ?? tierFromScore(score);

const readString = (dto: RiskResponseDto, key: string): string | null => {
  const value = dto[key];
  return typeof value === "string" ? value : null;
};

const readNumber = (dto: RiskResponseDto, key: string): number | null => {
  const value = dto[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return null;
};

export const toRiskAssessment = (
  dto: RiskResponseDto,
): Result<RiskAssessment, AppError> => {
  const fullName = readString(dto, RESPONSE_FIELD_ALIAS.name);
  const nationalId = readString(dto, RESPONSE_FIELD_ALIAS.national_id);
  const levelLabel = readString(dto, RESPONSE_FIELD_ALIAS.risk_level);
  const ageYears = readNumber(dto, RESPONSE_FIELD_ALIAS.age);
  const score = readNumber(dto, RESPONSE_FIELD_ALIAS.risk_score);

  if (
    fullName === null ||
    nationalId === null ||
    levelLabel === null ||
    ageYears === null ||
    score === null
  ) {
    // A shape we do not recognise means the two sides have drifted apart;
    // surfacing it as a server error beats rendering "undefined" to a user.
    return err(
      serverError(200, "پاسخ سرور قابل پردازش نبود. لطفاً با پشتیبانی تماس بگیرید."),
    );
  }

  return ok({
    fullName,
    nationalId,
    ageYears,
    score,
    levelLabel,
    tier: classify(levelLabel, score),
  });
};
