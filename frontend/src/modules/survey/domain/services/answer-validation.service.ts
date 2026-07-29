import { parseJalaliIso, todayJalali } from "@core/date/jalali";
import { toAsciiDigits, toPersianDigits } from "@core/text/digits";
import { err, ok, type Result } from "@core/result/result";

import {
  QuestionKind,
  type ChoiceQuestion,
  type Question,
  type QuestionId,
} from "@survey/domain/entities/question.entity";
import type { SurveyDefinition, SurveyStep } from "@survey/domain/entities/survey-definition.entity";
import {
  isAnswered,
  readList,
  readText,
  type SurveyAnswers,
  type ValidatedSurveyAnswers,
} from "@survey/domain/entities/survey-answers.entity";
import { NationalId } from "@survey/domain/value-objects/national-id.vo";
import {
  isQuestionVisible,
  visibleQuestionsOf,
} from "@survey/domain/services/question-visibility.service";

export type FieldErrors = Readonly<Partial<Record<QuestionId, string>>>;

const REQUIRED_MESSAGE = "پاسخ به این سوال الزامی است.";

/** Age in Jalali years, matching how the backend derives it from the birth year. */
export const jalaliAgeFrom = (isoJalaliDate: string): number | null => {
  const parts = parseJalaliIso(isoJalaliDate);
  if (!parts) return null;
  return todayJalali().year - parts.year;
};

const validateText = (question: Extract<Question, { kind: "text" }>, value: string): string | null => {
  const trimmed = value.trim();

  if (question.format === "national-id") {
    return NationalId.isValid(trimmed) ? null : "کد ملی وارد شده معتبر نیست.";
  }

  if (trimmed.length < 3) return "حداقل ۳ حرف وارد کنید.";
  if (question.maxLength && trimmed.length > question.maxLength) {
    return `حداکثر ${toPersianDigits(question.maxLength)} کاراکتر مجاز است.`;
  }

  return null;
};

const validateNumber = (
  question: Extract<Question, { kind: "number" }>,
  value: string,
): string | null => {
  const numeric = Number(toAsciiDigits(value).trim());

  if (!Number.isFinite(numeric)) return "لطفاً یک عدد معتبر وارد کنید.";
  if (numeric < question.min || numeric > question.max) {
    return `مقدار باید بین ${toPersianDigits(question.min)} و ${toPersianDigits(question.max)} باشد.`;
  }

  return null;
};

const validateJalaliDate = (
  question: Extract<Question, { kind: "jalali-date" }>,
  value: string,
): string | null => {
  const age = jalaliAgeFrom(value);
  if (age === null) return "تاریخ وارد شده معتبر نیست.";

  if (age < question.minAge || age > question.maxAge) {
    return `سن باید بین ${toPersianDigits(question.minAge)} و ${toPersianDigits(question.maxAge)} سال باشد.`;
  }

  return null;
};

/**
 * Rejects values that are not in the option list. This catches answers left
 * over from an earlier version of the questionnaire, which would otherwise
 * reach the backend and be scored as zero without any error.
 */
const validateChoice = (question: ChoiceQuestion, selected: readonly string[]): string | null => {
  const allowed = new Set(question.options.map((option) => option.value));
  const unknown = selected.find((value) => !allowed.has(value));

  return unknown === undefined ? null : "گزینه انتخاب‌شده معتبر نیست.";
};

/** Validates one answer. Returns a Persian message, or null when it is fine. */
export const validateQuestion = (
  question: Question,
  answers: SurveyAnswers,
): string | null => {
  const raw = answers[question.id];

  if (!isAnswered(raw)) {
    return question.required ? REQUIRED_MESSAGE : null;
  }

  switch (question.kind) {
    case QuestionKind.Text:
      return validateText(question, readText(answers, question.id));
    case QuestionKind.Number:
      return validateNumber(question, readText(answers, question.id));
    case QuestionKind.JalaliDate:
      return validateJalaliDate(question, readText(answers, question.id));
    case QuestionKind.SingleChoice:
    case QuestionKind.MultiChoice:
      return validateChoice(question, readList(answers, question.id));
  }
};

/** Validates only the questions currently shown on one step. */
export const validateStep = (
  definition: SurveyDefinition,
  step: SurveyStep,
  answers: SurveyAnswers,
): FieldErrors => collect(visibleQuestionsOf(definition, step, answers), answers);

/**
 * Validates the whole survey and, on success, brands the answers so they can
 * be handed to the repository port.
 */
export const validateAll = (
  definition: SurveyDefinition,
  answers: SurveyAnswers,
): Result<ValidatedSurveyAnswers, FieldErrors> => {
  const visible = definition
    .allQuestions()
    .filter((question) => isQuestionVisible(definition, question, answers));

  const errors = collect(visible, answers);

  return Object.keys(errors).length === 0
    ? ok(answers as ValidatedSurveyAnswers)
    : err(errors);
};

const collect = (questions: readonly Question[], answers: SurveyAnswers): FieldErrors => {
  const errors: Partial<Record<QuestionId, string>> = {};

  for (const question of questions) {
    const message = validateQuestion(question, answers);
    if (message) errors[question.id] = message;
  }

  return errors;
};
