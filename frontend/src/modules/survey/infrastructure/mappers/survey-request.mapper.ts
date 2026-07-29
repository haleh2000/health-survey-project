import { toAsciiDigits } from "@core/text/digits";

import type { QuestionId } from "@survey/domain/entities/question.entity";
import {
  readList,
  readText,
  type ValidatedSurveyAnswers,
} from "@survey/domain/entities/survey-answers.entity";
import {
  REQUEST_FIELD_ALIAS,
  UNMAPPED_QUESTIONS,
  type SubmittedQuestionId,
} from "@survey/infrastructure/contract/backend-contract";
import type { SurveyRequestDto } from "@survey/infrastructure/dto/survey.dto";
import { toBackendValue } from "@survey/infrastructure/mappers/backend-value.map";

/**
 * Builds the `POST /calculate_risk` body from validated answers.
 *
 * Three transformations happen here, each fixing a concrete mismatch between
 * what the UI stores and what `SurveyInput` accepts:
 *
 *   1. English question ids become Persian aliases (the only accepted keys).
 *   2. Answers the backend types as `List[str]` are always sent as arrays —
 *      `stroke_history` is a single-choice control in the UI but a list in the
 *      model, and sending a bare string there is a 422.
 *   3. `height`/`weight` become real numbers with ASCII digits, because
 *      `Field(gt=0)` rejects a string and `int()` cannot read Persian digits.
 */

/** Typed as `List[str]` in models.py, regardless of the UI control used. */
const LIST_FIELDS = new Set<SubmittedQuestionId>([
  "confirmed_diseases",
  "stroke_history",
  "cancer_types",
  "family_history",
]);

/** Typed as `float` with a `gt=0` constraint. */
const NUMBER_FIELDS = new Set<SubmittedQuestionId>(["height", "weight"]);

/** Digits must reach the backend as ASCII to survive `int()` / `float()`. */
const ASCII_DIGIT_FIELDS = new Set<SubmittedQuestionId>(["national_id", "birth_date"]);

const skipped = new Set<QuestionId>(UNMAPPED_QUESTIONS);

const submittedIds = Object.keys(REQUEST_FIELD_ALIAS) as SubmittedQuestionId[];

export const toSurveyRequestDto = (
  answers: ValidatedSurveyAnswers,
): SurveyRequestDto => {
  const body: Record<string, string | number | readonly string[]> = {};

  for (const id of submittedIds) {
    if (skipped.has(id)) continue;

    const alias = REQUEST_FIELD_ALIAS[id];

    if (LIST_FIELDS.has(id)) {
      body[alias] = readList(answers, id).map((value) => toBackendValue(id, value));
      continue;
    }

    const raw = readText(answers, id);

    // Optional fields with a backend default (`cigarettes_per_day`) are left
    // out entirely when unanswered rather than sent as an empty string, which
    // would fail the enum/lookup instead of falling back to the default.
    if (raw === "") continue;

    if (NUMBER_FIELDS.has(id)) {
      body[alias] = Number(toAsciiDigits(raw));
      continue;
    }

    body[alias] = ASCII_DIGIT_FIELDS.has(id)
      ? toAsciiDigits(raw)
      : toBackendValue(id, raw);
  }

  return body;
};
