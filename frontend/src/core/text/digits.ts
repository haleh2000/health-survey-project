/**
 * Digit normalisation.
 *
 * Persian keyboards produce ۰۱۲۳ and Arabic ones ٠١٢٣. Both must become ASCII
 * before any `Number()` call or before being sent to the backend, which parses
 * digits with `int()`. Conversely, display-only text reads better in Persian.
 */

const PERSIAN_ZERO = 0x06f0;
const ARABIC_ZERO = 0x0660;
const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

export const toAsciiDigits = (value: string): string =>
  value.replace(/[۰-۹٠-٩]/g, (char) => {
    const code = char.codePointAt(0) ?? 0;
    const base = code >= PERSIAN_ZERO ? PERSIAN_ZERO : ARABIC_ZERO;
    return String(code - base);
  });

export const toPersianDigits = (value: string | number): string =>
  String(value).replace(/\d/g, (digit) => PERSIAN_DIGITS[Number(digit)] ?? digit);
