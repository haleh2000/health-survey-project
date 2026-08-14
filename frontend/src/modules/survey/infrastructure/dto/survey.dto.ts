// src/survey/infrastructure/dto/survey.dto.ts

export type SurveyRequestDto = Readonly<
  Record<string, string | number | readonly string[]>
>;

export interface RiskResponseDto extends Record<string, unknown> {
  lung_risk?: number;
  gastric_risk?: number;
  colon_risk?: number;
  pancreas_risk?: number;
  stroke_risk?: number;
  cardiac_risk?: number;
  metabolic_risk?: number;
  liver_risk?: number;
  bmi?: number;
  flags?: {
    heavy_smoker?: boolean;
    hookah_ecig?: boolean;
    occupational_hazard?: boolean;
    air_pollution?: boolean;
    hpylori_active?: boolean;
    salty_food?: boolean;
    hot_drink?: boolean;
    smoked_food?: boolean;
    heavy_alcohol?: boolean;
    obesity?: boolean;
    processed_meat_high?: boolean;
    low_fiber?: boolean;
    junk_food?: boolean;
    low_physical_activity?: boolean;
    diabetes?: boolean;
    hypertension?: boolean;
    heart_disease?: boolean;
    chronic_pancreatitis?: boolean;
    psychosocial?: boolean;
    infectious_disease?: boolean;
    brain_stroke_history?: boolean;
    heart_attack_history?: boolean;
    family_lung_cancer?: boolean;
    family_gastric_cancer?: boolean;
    family_colon_cancer?: boolean;
    family_pancreas_cancer?: boolean;
    family_liver_cancer?: boolean;
    family_stroke?: boolean;
    family_cardiac?: boolean;
  };
}
