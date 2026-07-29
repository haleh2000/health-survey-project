import { isAnswered, type SurveyAnswers } from "@survey/domain/entities/survey-answers.entity";
import type { SurveyDefinition } from "@survey/domain/entities/survey-definition.entity";
import { allVisibleQuestions } from "@survey/domain/services/question-visibility.service";

export interface SurveyProgress {
  readonly answered: number;
  /** Counts only questions currently visible, so the total moves as the user answers. */
  readonly total: number;
  readonly ratio: number;
}

/**
 * Progress over *visible* questions.
 *
 * Counting hidden follow-ups would make the bar jump backwards the moment a
 * conditional question appears, so the denominator tracks visibility too.
 */
export class SurveyProgressUseCase {
  private readonly definition: SurveyDefinition;

  constructor(definition: SurveyDefinition) {
    this.definition = definition;
  }

  execute(answers: SurveyAnswers): SurveyProgress {
    const visible = allVisibleQuestions(this.definition, answers);
    const answered = visible.filter((question) => isAnswered(answers[question.id])).length;
    const total = visible.length;

    return { answered, total, ratio: total === 0 ? 0 : answered / total };
  }
}
