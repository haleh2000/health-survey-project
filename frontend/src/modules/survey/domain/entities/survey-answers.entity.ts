import type { QuestionId } from "@survey/domain/entities/question.entity";

export type AnswerValue = string | readonly string[];

export type SurveyAnswers = Readonly<Partial<Record<QuestionId, AnswerValue>>>;

declare const VALIDATED: unique symbol;

export type ValidatedSurveyAnswers = SurveyAnswers & {
  readonly [VALIDATED]: true;
};

export const readText = (answers: SurveyAnswers, id: QuestionId): string => {
  const value = answers[id];
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0] ?? "";
  return "";
};

export const readList = (answers: SurveyAnswers, id: QuestionId): readonly string[] => {
  const value = answers[id];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return value.length > 0 ? [value] : [];
  return [];
};

export const isAnswered = (value: AnswerValue | undefined): boolean =>
  Array.isArray(value) ? value.length > 0 : typeof value === "string" && value.trim().length > 0;
