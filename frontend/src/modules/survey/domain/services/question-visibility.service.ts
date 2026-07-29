import type { Question, QuestionId } from "@survey/domain/entities/question.entity";
import type { SurveyDefinition, SurveyStep } from "@survey/domain/entities/survey-definition.entity";
import { readText, type SurveyAnswers } from "@survey/domain/entities/survey-answers.entity";

/**
 * Conditional-question rules.
 *
 * Visibility is transitive: a question hidden because its parent is hidden
 * must stay hidden even if its own rule happens to match a stale answer.
 * `SurveyDefinition` guarantees rules only ever point backwards, so walking
 * the chain always terminates.
 */
export const isQuestionVisible = (
  definition: SurveyDefinition,
  question: Question,
  answers: SurveyAnswers,
): boolean => {
  const rule = question.visibleWhen;
  if (!rule) return true;

  const parent = definition.question(rule.questionId);
  if (!isQuestionVisible(definition, parent, answers)) return false;

  return readText(answers, rule.questionId) === rule.equals;
};

export const visibleQuestionsOf = (
  definition: SurveyDefinition,
  step: SurveyStep,
  answers: SurveyAnswers,
): readonly Question[] =>
  definition
    .questionsOf(step)
    .filter((question) => isQuestionVisible(definition, question, answers));

export const allVisibleQuestions = (
  definition: SurveyDefinition,
  answers: SurveyAnswers,
): readonly Question[] =>
  definition
    .allQuestions()
    .filter((question) => isQuestionVisible(definition, question, answers));

/**
 * Drops answers whose question is no longer shown.
 *
 * Without this, answering "بله" to the cancer question, ticking cancer types,
 * then switching back to "خیر" would still submit those types — and the
 * backend would score them.
 */
export const pruneHiddenAnswers = (
  definition: SurveyDefinition,
  answers: SurveyAnswers,
): SurveyAnswers => {
  const kept: Partial<Record<QuestionId, SurveyAnswers[QuestionId]>> = {};
  let changed = false;

  for (const question of definition.allQuestions()) {
    const value = answers[question.id];
    if (value === undefined) continue;

    if (isQuestionVisible(definition, question, answers)) {
      kept[question.id] = value;
    } else {
      changed = true;
    }
  }

  return changed ? kept : answers;
};
