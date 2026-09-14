import type { HttpClient } from "@core/http/http-client.port";
import { err, ok, type Result } from "@core/result/result";
import type { AppError } from "@core/errors/app-error";
import type { RiskTier, AssessmentFlags } from "@survey/domain/entities/risk-assessment.entity";
import type { AssessmentRecord } from "@survey/infrastructure/storage/assessment-history.storage";
import type { HistoryRepository } from "@survey/domain/ports/history.repository";
import { formatJalaliIso, gregorianToJalali } from "@core/date/jalali";

const ENDPOINT_PREFIX = "/submissions";

interface SubmissionDto {
  id: number;
  full_name: string | null;
  risk_score: number;
  risk_level: string;
  bmi: number;
  age: number;
  height: number;
  weight: number;
  created_at: string;
}

interface SubmissionDetailDto extends SubmissionDto {
  person_national_id: string;
  gender: string | null;
  birth_date: string | null;

  smoking_status: string;
  cigarettes_per_day: string;
  hookah_ecig: string;
  alcohol: string;
  adds_salt: string;
  hot_drink_temp: string;
  junk_food: string;
  processed_meat: string;
  veg_fruit: string;
  smoked_food: string;
  air_pollution: string;
  occupational_hazard: string;
  physical_activity: string;

  confirmed_diseases: string[];
  stroke_history: string[];
  h_pylori: string;
  cancer_history: string;
  cancer_types: string[];
  family_history: string[];

  lung_risk: number;
  gastric_risk: number;
  colon_risk: number;
  pancreas_risk: number;
  stroke_risk: number;
  cardiac_risk: number;
  metabolic_risk: number;
  liver_risk: number;

  flags: AssessmentFlags;
}

function dtoToRecord(dto: SubmissionDto, nationalId: string): AssessmentRecord {
  const jalali = gregorianToJalali(dto.created_at);
  return {
    assessment: {
      fullName: dto.full_name ?? "",
      nationalId,
      ageYears: dto.age,
      score: dto.risk_score,
      levelLabel: dto.risk_level,
      tier: "low" as RiskTier,
      organRisks: {
        lung: 0,
        gastric: 0,
        colon: 0,
        pancreas: 0,
        stroke: 0,
        cardiac: 0,
        metabolic: 0,
        liver: 0,
      },
      bmi: dto.bmi,
      flags: {
        heavy_smoker: false,
        hookah_ecig: false,
        occupational_hazard: false,
        air_pollution: false,
        hpylori_active: false,
        salty_food: false,
        hot_drink: false,
        smoked_food: false,
        heavy_alcohol: false,
        obesity: false,
        processed_meat_high: false,
        low_fiber: false,
        junk_food: false,
        low_physical_activity: false,
        diabetes: false,
        hypertension: false,
        heart_disease: false,
        chronic_pancreatitis: false,
        psychosocial: false,
        infectious_disease: false,
        brain_stroke_history: false,
        heart_attack_history: false,
        family_lung_cancer: false,
        family_gastric_cancer: false,
        family_colon_cancer: false,
        family_pancreas_cancer: false,
        family_liver_cancer: false,
        family_stroke: false,
        family_cardiac: false,
      },
    },
    nationalId,
    submissionId: dto.id,
    completedOnJalali: formatJalaliIso(jalali),
    completedAt: new Date(dto.created_at).getTime(),
    heightCm: dto.height,
    weightKg: dto.weight,
  };
}

function detailDtoToRecord(dto: SubmissionDetailDto): AssessmentRecord {
  const tier: RiskTier =
    dto.risk_score >= 70
      ? "critical"
      : dto.risk_score >= 40
      ? "elevated"
      : dto.risk_score >= 20
      ? "moderate"
      : "low";

  const jalali = gregorianToJalali(dto.created_at);

  return {
    assessment: {
      fullName: dto.full_name ?? "",
      nationalId: dto.person_national_id,
      ageYears: dto.age,
      score: dto.risk_score,
      levelLabel: dto.risk_level,
      tier,
      organRisks: {
        lung: dto.lung_risk,
        gastric: dto.gastric_risk,
        colon: dto.colon_risk,
        pancreas: dto.pancreas_risk,
        stroke: dto.stroke_risk,
        cardiac: dto.cardiac_risk,
        metabolic: dto.metabolic_risk,
        liver: dto.liver_risk,
      },
      bmi: dto.bmi,
      flags: dto.flags,
    },
    nationalId: dto.person_national_id,
    completedOnJalali: formatJalaliIso(jalali),
    completedAt: new Date(dto.created_at).getTime(),
    heightCm: dto.height,
    weightKg: dto.weight,
  };
}

export class HttpHistoryRepository implements HistoryRepository {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  async fetchByNationalId(
    nationalId: string,
  ): Promise<Result<readonly AssessmentRecord[], AppError>> {
    const response = await this.http.get<SubmissionDto[]>(
      `${ENDPOINT_PREFIX}/${nationalId}`,
    );

    if (!response.ok) return err(response.error);

    return ok(response.value.map((dto) => dtoToRecord(dto, nationalId)));
  }

  async fetchBySubmissionId(
    nationalId: string,
    submissionId: number,
  ): Promise<Result<AssessmentRecord, AppError>> {
    const response = await this.http.get<SubmissionDetailDto>(
      `${ENDPOINT_PREFIX}/${nationalId}/${submissionId}`,
    );

    if (!response.ok) return err(response.error);

    return ok(detailDtoToRecord(response.value));
  }
}
