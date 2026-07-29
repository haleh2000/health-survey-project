import { err, type Result } from "@core/result/result";

import {
  invalidSubmission,
  remoteFailure,
  type SubmitSurveyFailure,
} from "@survey/application/dto/submit-survey.dto";
import type { RiskAssessment } from "@survey/domain/entities/risk-assessment.entity";
import type { SurveyAnswers } from "@survey/domain/entities/survey-answers.entity";
import type { SurveyDefinition } from "@survey/domain/entities/survey-definition.entity";
import type { RiskAssessmentRepository } from "@survey/domain/ports/risk-assessment.repository";
import { validateAll } from "@survey/domain/services/answer-validation.service";
import { pruneHiddenAnswers } from "@survey/domain/services/question-visibility.service";

/**
 * Turns a finished questionnaire into a risk assessment.
 *
 * Order matters. Hidden answers are dropped *before* validation, otherwise a
 * question the user has since hidden could block submission with an error they
 * cannot even see — and its stale value would be scored by the backend.
 */
export class SubmitSurveyUseCase {
  private readonly definition: SurveyDefinition;
  private readonly repository: RiskAssessmentRepository;

  constructor(definition: SurveyDefinition, repository: RiskAssessmentRepository) {
    this.definition = definition;
    this.repository = repository;
  }

  async execute(
    answers: SurveyAnswers,
  ): Promise<Result<RiskAssessment, SubmitSurveyFailure>> {
    const relevant = pruneHiddenAnswers(this.definition, answers);
    const validation = validateAll(this.definition, relevant);

    if (!validation.ok) return err(invalidSubmission(validation.error));

    const assessment = await this.repository.assess(validation.value);

    return assessment.ok ? assessment : err(remoteFailure(assessment.error));
  }
}
