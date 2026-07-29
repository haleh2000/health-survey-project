import type { AppError } from "@core/errors/app-error";
import type { Result } from "@core/result/result";

import type { RiskAssessment } from "@survey/domain/entities/risk-assessment.entity";
import type { ValidatedSurveyAnswers } from "@survey/domain/entities/survey-answers.entity";

/**
 * The outbound port for scoring a completed survey.
 *
 * It accepts `ValidatedSurveyAnswers` rather than raw answers, so a caller
 * physically cannot submit un-validated input — the brand is only produced by
 * the validation service. Implemented in `infrastructure/repositories`.
 */
export interface RiskAssessmentRepository {
  assess(
    answers: ValidatedSurveyAnswers,
  ): Promise<Result<RiskAssessment, AppError>>;
}
