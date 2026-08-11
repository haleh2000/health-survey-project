import { ErrorKind, validationError, type AppError } from "@core/errors/app-error";
import type { HttpClient } from "@core/http/http-client.port";
import { err, type Result } from "@core/result/result";

import type { QuestionId } from "@survey/domain/entities/question.entity";
import type { RiskAssessment } from "@survey/domain/entities/risk-assessment.entity";
import type { ValidatedSurveyAnswers } from "@survey/domain/entities/survey-answers.entity";
import type { RiskAssessmentRepository } from "@survey/domain/ports/risk-assessment.repository";
import { REQUEST_FIELD_ALIAS } from "@survey/infrastructure/contract/backend-contract";
import type { RiskResponseDto } from "@survey/infrastructure/dto/survey.dto";
import { toRiskAssessment } from "@survey/infrastructure/mappers/risk-response.mapper";
import { toSurveyRequestDto } from "@survey/infrastructure/mappers/survey-request.mapper";

const ENDPOINT = "/calculate_risk";

/** Persian alias → question id, so a 422 can be pinned to the right control. */
const QUESTION_ID_BY_ALIAS: ReadonlyMap<string, QuestionId> = new Map(
  Object.entries(REQUEST_FIELD_ALIAS).map(([id, alias]) => [alias, id as QuestionId]),
);

export class HttpRiskAssessmentRepository implements RiskAssessmentRepository {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  async assess(
    answers: ValidatedSurveyAnswers,
  ): Promise<Result<RiskAssessment, AppError>> {
    const response = await this.http.post<RiskResponseDto>(
      ENDPOINT,
      toSurveyRequestDto(answers),
    );

    if (!response.ok) return err(this.withQuestionIds(response.error));

    return toRiskAssessment(response.value);
  }

  private withQuestionIds(error: AppError): AppError {
    if (error.kind !== ErrorKind.Validation || !error.fieldErrors) return error;

    const remapped: Record<string, string> = {};
    for (const [alias, message] of Object.entries(error.fieldErrors)) {
      remapped[QUESTION_ID_BY_ALIAS.get(alias) ?? alias] = message;
    }

    return validationError(error.message, remapped);
  }
}
