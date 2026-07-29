import { toPersianDigits } from "@core/text/digits";

/**
 * Display-side formatting.
 *
 * Persian digits are used for everything the user reads, and never for values
 * that get parsed or submitted — that conversion belongs to the request
 * mapper, which goes the other way.
 */

export const persianInteger = (value: number): string =>
  toPersianDigits(Math.round(value));

/** Scores arrive as floats such as 12.700000000000001. */
export const persianDecimal = (value: number, fractionDigits = 1): string =>
  toPersianDigits(value.toFixed(fractionDigits));

/** "۲ از ۵" */
export const persianRatio = (current: number, total: number): string =>
  `${toPersianDigits(current)} از ${toPersianDigits(total)}`;
