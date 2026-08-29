import type { HttpClient } from "@core/http/http-client.port";
import { err, ok, type Result } from "@core/result/result";
import type { AppError } from "@core/errors/app-error";
import type { RiskTier } from "@survey/domain/entities/risk-assessment.entity";
import type { AssessmentRecord } from "@survey/infrastructure/storage/assessment-history.storage";
import type { HistoryRepository } from "@survey/domain/ports/history.repository";

const ENDPOINT_PREFIX = "/submissions";

interface SubmissionDto {
  id: number;
  full_name: string;
  risk_score: number;
  risk_level: string;
  bmi: number;
  created_at: string;
}

function dtoToRecord(dto: SubmissionDto): AssessmentRecord {
  return {
    assessment: {
      fullName: dto.full_name,
      nationalId: "",
      ageYears: 0,
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
    completedOnJalali: dto.created_at.slice(0, 10),
    completedAt: new Date(dto.created_at).getTime(),
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

    return ok(response.value.map(dtoToRecord));
  }
}
