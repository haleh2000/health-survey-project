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

const LABEL_TO_TIER: ReadonlyMap<string, RiskTier> = new Map([
  [RISK_LEVEL_LABEL.low, RiskTier.Low],
  [RISK_LEVEL_LABEL.moderate, RiskTier.Moderate],
  [RISK_LEVEL_LABEL.elevated, RiskTier.Elevated],
  [RISK_LEVEL_LABEL.critical, RiskTier.Critical],
]);

const tierFromScore = (score: number): RiskTier => {
  if (score <= 5) return RiskTier.Low;
  if (score <= 10) return RiskTier.Moderate;
  if (score <= 16) return RiskTier.Elevated;
  return RiskTier.Critical;
};

const classify = (label: string, score: number): RiskTier => {
  // اگر امتیاز معتبره، فقط از اون استفاده کن
  if (Number.isFinite(score)) return tierFromScore(score);
  
  // فقط اگر score نامعتبر بود، از label استفاده کن
  const t = label.trim();
  if (t.includes("گروه ۱") || t.includes("گروه 1")) return RiskTier.Critical;
  if (t.includes("گروه ۲") || t.includes("گروه 2")) return RiskTier.Elevated;
  if (t.includes("گروه ۳") || t.includes("گروه 3")) return RiskTier.Moderate;
  if (t.includes("گروه ۴") || t.includes("گروه 4")) return RiskTier.Low;
  return LABEL_TO_TIER.get(t) ?? RiskTier.Low;
};


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
