// src/survey/infrastructure/mappers/risk-assessment.mapper.ts

import { serverError, type AppError } from "@core/errors/app-error";
import { err, ok, type Result } from "@core/result/result";

import {
  RiskTier,
  type OrganRisks,
  type RiskAssessment,
  type AssessmentFlags,
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
  if (Number.isFinite(score)) return tierFromScore(score);

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
  if (
    typeof value === "string" &&
    value.trim() !== "" &&
    Number.isFinite(Number(value))
  ) {
    return Number(value);
  }
  return null;
};

const readFlag = (dto: RiskResponseDto, key: string): boolean => {
  const flags = dto["flags"];
  if (flags && typeof flags === "object" && !Array.isArray(flags)) {
    const val = (flags as Record<string, unknown>)[key];
    return Boolean(val);
  }
  return false;
};

const mapFlags = (dto: RiskResponseDto): AssessmentFlags => ({
  heavy_smoker:           readFlag(dto, "heavy_smoker"),
  hookah_ecig:            readFlag(dto, "hookah_ecig"),
  occupational_hazard:    readFlag(dto, "occupational_hazard"),
  air_pollution:          readFlag(dto, "air_pollution"),
  hpylori_active:         readFlag(dto, "hpylori_active"),
  salty_food:             readFlag(dto, "salty_food"),
  hot_drink:              readFlag(dto, "hot_drink"),
  smoked_food:            readFlag(dto, "smoked_food"),
  heavy_alcohol:          readFlag(dto, "heavy_alcohol"),
  obesity:                readFlag(dto, "obesity"),
  processed_meat_high:    readFlag(dto, "processed_meat_high"),
  low_fiber:              readFlag(dto, "low_fiber"),
  junk_food:              readFlag(dto, "junk_food"),
  low_physical_activity:  readFlag(dto, "low_physical_activity"),
  diabetes:               readFlag(dto, "diabetes"),
  hypertension:           readFlag(dto, "hypertension"),
  heart_disease:          readFlag(dto, "heart_disease"),
  chronic_pancreatitis:   readFlag(dto, "chronic_pancreatitis"),
  psychosocial:           readFlag(dto, "psychosocial"),
  infectious_disease:     readFlag(dto, "infectious_disease"),
  brain_stroke_history:   readFlag(dto, "brain_stroke_history"),
  heart_attack_history:   readFlag(dto, "heart_attack_history"),
  family_lung_cancer:     readFlag(dto, "family_lung_cancer"),
  family_gastric_cancer:  readFlag(dto, "family_gastric_cancer"),
  family_colon_cancer:    readFlag(dto, "family_colon_cancer"),
  family_pancreas_cancer: readFlag(dto, "family_pancreas_cancer"),
  family_liver_cancer:    readFlag(dto, "family_liver_cancer"),
  family_stroke:          readFlag(dto, "family_stroke"),
  family_cardiac:         readFlag(dto, "family_cardiac"),
});

export const toRiskAssessment = (
  dto: RiskResponseDto,
): Result<RiskAssessment, AppError> => {
  const fullName    = readString(dto, RESPONSE_FIELD_ALIAS.name);
  const nationalId  = readString(dto, RESPONSE_FIELD_ALIAS.national_id);
  const levelLabel  = readString(dto, RESPONSE_FIELD_ALIAS.risk_level);
  const ageYears    = readNumber(dto, RESPONSE_FIELD_ALIAS.age);
  const score       = readNumber(dto, RESPONSE_FIELD_ALIAS.risk_score);

  if (
    fullName === null ||
    nationalId === null ||
    levelLabel === null ||
    ageYears === null ||
    score === null
  ) {
    return err(
      serverError(
        200,
        "پاسخ سرور قابل پردازش نبود. لطفاً با پشتیبانی تماس بگیرید.",
      ),
    );
  }

  const organRisks: OrganRisks = {
    lung:      readNumber(dto, "lung_risk")      ?? 0,
    gastric:   readNumber(dto, "gastric_risk")   ?? 0,
    colon:     readNumber(dto, "colon_risk")      ?? 0,
    pancreas:  readNumber(dto, "pancreas_risk")  ?? 0,
    stroke:    readNumber(dto, "stroke_risk")    ?? 0,
    cardiac:   readNumber(dto, "cardiac_risk")   ?? 0,
    metabolic: readNumber(dto, "metabolic_risk") ?? 0,
    liver:     readNumber(dto, "liver_risk")     ?? 0,
  };

  const bmi = readNumber(dto, "bmi");

  return ok({
    fullName,
    nationalId,
    ageYears,
    score,
    levelLabel,
    tier:       classify(levelLabel, score),
    organRisks,
    bmi,
    flags:      mapFlags(dto),
  });
};
