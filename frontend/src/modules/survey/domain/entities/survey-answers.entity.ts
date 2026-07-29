import type { QuestionId } from "@survey/domain/entities/question.entity";

/**
 * Answers are held as strings (or lists of strings) exactly as the user picked
 * them. Numeric coercion happens at the edges — validation checks it, the
 * request mapper performs it — so a half-typed "17" never becomes `NaN`
 * mid-edit and inputs stay controlled.
 */
export type AnswerValue = string | readonly string[];

export type SurveyAnswers = Readonly<Partial<Record<QuestionId, AnswerValue>>>;

declare const VALIDATED: unique symbol;

/**
 * Answers that have passed every domain rule.
 *
 * Only `AnswerValidationService.validateAll` can produce this type, so a use
 * case cannot forget to validate before submitting — the repository port only
 * accepts the branded type.
 */
export type ValidatedSurveyAnswers = SurveyAnswers & {
  readonly [VALIDATED]: true;
};

/** Reads a single-valued answer, normalising "absent" to an empty string. */
export const readText = (answers: SurveyAnswers, id: QuestionId): string => {
  const value = answers[id];
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0] ?? "";
  return "";
};

/** Reads a multi-valued answer, normalising "absent" to an empty list. */
export const readList = (answers: SurveyAnswers, id: QuestionId): readonly string[] => {
  const value = answers[id];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return value.length > 0 ? [value] : [];
  return [];
};

export const isAnswered = (value: AnswerValue | undefined): boolean =>
  Array.isArray(value) ? value.length > 0 : typeof value === "string" && value.trim().length > 0;
