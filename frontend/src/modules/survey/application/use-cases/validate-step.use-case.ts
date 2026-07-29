import type { SurveyAnswers } from "@survey/domain/entities/survey-answers.entity";
import type { SurveyDefinition } from "@survey/domain/entities/survey-definition.entity";
import {
  validateStep,
  type FieldErrors,
} from "@survey/domain/services/answer-validation.service";

export interface StepValidationResult {
  readonly errors: FieldErrors;
  /** True when the wizard is allowed to move forward. */
  readonly canAdvance: boolean;
}

/** Gate for the "بعدی" button: a step is only passable once it is error-free. */
export class ValidateStepUseCase {
  private readonly definition: SurveyDefinition;

  constructor(definition: SurveyDefinition) {
    this.definition = definition;
  }

  execute(stepPosition: number, answers: SurveyAnswers): StepValidationResult {
    const step = this.definition.stepAt(stepPosition);
    if (!step) return { errors: {}, canAdvance: false };

    const errors = validateStep(this.definition, step, answers);

    return { errors, canAdvance: Object.keys(errors).length === 0 };
  }
}
