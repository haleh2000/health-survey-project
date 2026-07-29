import type { Question, QuestionId } from "@survey/domain/entities/question.entity";

export interface SurveyStep {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly questionIds: readonly QuestionId[];
}

/**
 * The survey as a whole: ordered steps plus an indexed question catalogue.
 *
 * Built once from plain data (see `infrastructure/definition`) and treated as
 * immutable, so the wizard can look questions up in O(1) without re-scanning
 * the step list on every keystroke.
 */
export class SurveyDefinition {
  readonly steps: readonly SurveyStep[];

  private readonly index: ReadonlyMap<QuestionId, Question>;

  private constructor(steps: readonly SurveyStep[], questions: readonly Question[]) {
    this.steps = steps;
    this.index = new Map(questions.map((question) => [question.id, question]));
  }

  static create(steps: readonly SurveyStep[], questions: readonly Question[]): SurveyDefinition {
    const definition = new SurveyDefinition(steps, questions);
    definition.assertConsistent();
    return definition;
  }

  get stepCount(): number {
    return this.steps.length;
  }

  stepAt(position: number): SurveyStep | undefined {
    return this.steps[position];
  }

  question(id: QuestionId): Question {
    const question = this.index.get(id);
    // A missing id can only mean the definition data is wrong, which
    // `assertConsistent` already rules out at construction time.
    if (!question) throw new Error(`Unknown question id: ${id}`);
    return question;
  }

  questionsOf(step: SurveyStep): readonly Question[] {
    return step.questionIds.map((id) => this.question(id));
  }

  /** Which step a question lives on, or -1. Used to jump to a failed answer. */
  stepIndexOf(id: QuestionId): number {
    return this.steps.findIndex((step) => step.questionIds.includes(id));
  }

  allQuestions(): readonly Question[] {
    return [...this.index.values()];
  }

  /**
   * Catches definition mistakes at startup rather than as a blank step in
   * production: unknown ids, duplicates, and visibility rules that point at a
   * question the user has not reached yet.
   */
  private assertConsistent(): void {
    const seen = new Set<QuestionId>();
    const positionOf = new Map<QuestionId, number>();

    this.steps.forEach((step, stepPosition) => {
      for (const id of step.questionIds) {
        if (!this.index.has(id)) {
          throw new Error(`Step "${step.id}" references unknown question "${id}".`);
        }
        if (seen.has(id)) {
          throw new Error(`Question "${id}" appears in more than one step.`);
        }
        seen.add(id);
        positionOf.set(id, stepPosition);
      }
    });

    for (const question of this.index.values()) {
      if (!seen.has(question.id)) {
        throw new Error(`Question "${question.id}" is not assigned to any step.`);
      }

      const rule = question.visibleWhen;
      if (!rule) continue;

      const dependencyStep = positionOf.get(rule.questionId);
      if (dependencyStep === undefined) {
        throw new Error(
          `Question "${question.id}" depends on unknown question "${rule.questionId}".`,
        );
      }
      if (dependencyStep > (positionOf.get(question.id) ?? 0)) {
        throw new Error(
          `Question "${question.id}" depends on "${rule.questionId}", which appears in a later step.`,
        );
      }
    }
  }
}
