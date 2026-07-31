import type { ChoiceQuestion, Question } from "@survey/domain/entities/question.entity";
import { readList, type SurveyAnswers } from "@survey/domain/entities/survey-answers.entity";


const exclusiveValues = (question: ChoiceQuestion): ReadonlySet<string> =>
  new Set(
    question.options.filter((option) => option.exclusive).map((option) => option.value),
  );

export const setAnswer = (
  answers: SurveyAnswers,
  question: Question,
  value: string,
): SurveyAnswers => ({ ...answers, [question.id]: value });

/**
 * Adds or removes one value from a multi-choice answer.
 *
 * Picking an exclusive option ("هیچکدام") clears everything else; picking any
 * other option clears the exclusive ones, so the two can never coexist.
 */
export const toggleAnswer = (
  answers: SurveyAnswers,
  question: ChoiceQuestion,
  value: string,
): SurveyAnswers => {
  const current = readList(answers, question.id);
  const exclusives = exclusiveValues(question);

  if (current.includes(value)) {
    return { ...answers, [question.id]: current.filter((item) => item !== value) };
  }

  if (exclusives.has(value)) {
    return { ...answers, [question.id]: [value] };
  }

  const withoutExclusives = current.filter((item) => !exclusives.has(item));
  return { ...answers, [question.id]: [...withoutExclusives, value] };
};
