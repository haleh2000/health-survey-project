/**
 * The question model.
 *
 * `QuestionId` is a closed union rather than a bare `string` on purpose: the
 * backend contract map in `infrastructure/mappers` is typed as
 * `Record<QuestionId, …>`, so adding a question here fails the build until its
 * backend alias is declared too. That is the compile-time guard against the
 * silent frontend/backend drift this survey suffered from.
 */
export type QuestionId =
  | "full_name"
  | "national_id"
  | "gender"
  | "birth_date"
  | "height"
  | "weight"
  | "confirmed_diseases"
  | "h_pylori"
  | "stroke_history"
  | "cancer_history"
  | "cancer_types"
  | "smoking_status"
  | "cigarettes_per_day"
  | "hookah_ecig"
  | "alcohol"
  | "physical_activity"
  | "adds_salt"
  | "hot_drink_temp"
  | "junk_food"
  | "processed_meat"
  | "veg_fruit"
  | "smoked_food"
  | "family_history"
  | "occupational_hazard"
  | "air_pollution"
  | "solid_fuel";

export const QuestionKind = {
  Text: "text",
  Number: "number",
  JalaliDate: "jalali-date",
  SingleChoice: "single-choice",
  MultiChoice: "multi-choice",
} as const;

export type QuestionKind = (typeof QuestionKind)[keyof typeof QuestionKind];

export interface ChoiceOption {
  /** The canonical UI value. Stored in the answers map and shown to the user. */
  readonly value: string;
  /**
   * Marks a "none of the above" style option: selecting it clears every other
   * choice, and choosing anything else clears it. Prevents answers that
   * contradict themselves, e.g. "هیچکدام" alongside "دیابت".
   */
  readonly exclusive?: boolean;
}

/** Shows the question only when another answer holds a specific value. */
export interface VisibilityRule {
  readonly questionId: QuestionId;
  readonly equals: string;
}

interface QuestionBase {
  readonly id: QuestionId;
  readonly title: string;
  readonly hint?: string;
  readonly required: boolean;
  readonly visibleWhen?: VisibilityRule;
}

export interface TextQuestion extends QuestionBase {
  readonly kind: typeof QuestionKind.Text;
  readonly maxLength?: number;
  /** Enables the national-id checksum rule during validation. */
  readonly format?: "national-id";
  readonly placeholder?: string;
}

export interface NumberQuestion extends QuestionBase {
  readonly kind: typeof QuestionKind.Number;
  readonly min: number;
  readonly max: number;
  readonly unit?: string;
}

export interface JalaliDateQuestion extends QuestionBase {
  readonly kind: typeof QuestionKind.JalaliDate;
  readonly minAge: number;
  readonly maxAge: number;
}

export interface SingleChoiceQuestion extends QuestionBase {
  readonly kind: typeof QuestionKind.SingleChoice;
  readonly options: readonly ChoiceOption[];
}

export interface MultiChoiceQuestion extends QuestionBase {
  readonly kind: typeof QuestionKind.MultiChoice;
  readonly options: readonly ChoiceOption[];
}

export type Question =
  | TextQuestion
  | NumberQuestion
  | JalaliDateQuestion
  | SingleChoiceQuestion
  | MultiChoiceQuestion;

export type ChoiceQuestion = SingleChoiceQuestion | MultiChoiceQuestion;

export const isChoiceQuestion = (question: Question): question is ChoiceQuestion =>
  question.kind === QuestionKind.SingleChoice ||
  question.kind === QuestionKind.MultiChoice;

/** True when the answer is a list, which decides the shape stored per question. */
export const isMultiValued = (question: Question): boolean =>
  question.kind === QuestionKind.MultiChoice;
