import type { QuestionId } from "@survey/domain/entities/question.entity";
import { BACKEND_VALUE } from "@survey/infrastructure/contract/backend-contract";

/**
 * The anti-corruption layer: UI wording → the exact string the backend scores.
 *
 * Only questions whose display text differs from the backend's expected value
 * appear here. The differences are not stylistic — they are the drift that
 * used to make answers score zero:
 *
 *   • `alcohol` / `hot_drink_temp` are Pydantic enums, so a mismatch is a 422.
 *   • `cigarettes_per_day`, `junk_food`, `processed_meat`, `veg_fruit` are
 *     dictionary lookups with a `0` default, so a mismatch scores zero in
 *     silence — the worse of the two failures.
 *
 * `assertContractCoverage` requires every option of a question listed here to
 * have an entry, so adding an option without translating it fails at startup
 * rather than at scoring time.
 */
export const BACKEND_VALUE_TRANSLATION: Partial<
  Record<QuestionId, Readonly<Record<string, string>>>
> = {
  // Backend keys are "بین ۱۰تا ۲۰ نخ" (no space) and "بیشتر از 20 نخ" (ASCII 20).
  cigarettes_per_day: {
    "کمتر از ۱۰ نخ": BACKEND_VALUE.cigarettesPerDay.under10,
    "بین ۱۰ تا ۲۰ نخ": BACKEND_VALUE.cigarettesPerDay.between10And20,
    "بیشتر از ۲۰ نخ": BACKEND_VALUE.cigarettesPerDay.over20,
  },

  alcohol: {
    "مصرف نمی‌کنم": BACKEND_VALUE.alcohol.none,
    "گهگاهی (کمتر از ۱ بار در هفته)": BACKEND_VALUE.alcohol.occasional,
    "منظم (بیشتر از ۱ بار در هفته یا مقادیر زیاد)": BACKEND_VALUE.alcohol.regular,
  },

  // The backend only models two temperatures; "ولرم یا گرم معمولی" folds into "گرم".
  hot_drink_temp: {
    "ولرم یا گرم معمولی": BACKEND_VALUE.hotDrink.warm,
    [BACKEND_VALUE.hotDrink.veryHot]: BACKEND_VALUE.hotDrink.veryHot,
  },

  // Backend uses ASCII "1-2" / "3", the UI uses Persian digits.
  junk_food: {
    "کم (ماهیانه ۱-۲ بار)": BACKEND_VALUE.junkFood.low,
    "متوسط (هفته‌ای ۱-۲ بار)": BACKEND_VALUE.junkFood.medium,
    "زیاد (بیشتر از ۳ بار در هفته)": BACKEND_VALUE.junkFood.high,
  },

  processed_meat: {
    [BACKEND_VALUE.processedMeat.rare]: BACKEND_VALUE.processedMeat.rare,
    [BACKEND_VALUE.processedMeat.medium]: BACKEND_VALUE.processedMeat.medium,
    "زیاد (بیشتر از ۲-۳ وعده در هفته)": BACKEND_VALUE.processedMeat.high,
  },

  // Backend writes "۱تا ۲" without a space.
  veg_fruit: {
    "کمتر از ۱ واحد در روز": BACKEND_VALUE.vegFruit.low,
    "۱ تا ۲ واحد در روز": BACKEND_VALUE.vegFruit.medium,
    "۳ واحد یا بیشتر در روز": BACKEND_VALUE.vegFruit.high,
  },
};

/**
 * Translates one answer. Values for untranslated questions pass through, which
 * is correct for the free-text fields the backend keyword-matches
 * (`h_pylori`, `physical_activity`, the checkbox lists).
 */
export const toBackendValue = (questionId: QuestionId, value: string): string =>
  BACKEND_VALUE_TRANSLATION[questionId]?.[value] ?? value;
