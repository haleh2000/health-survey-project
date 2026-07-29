/**
 * Wire shapes. Keys are the Persian aliases from `backend-contract.ts`, so
 * both types are index signatures rather than named fields — the aliases are
 * runtime constants, not identifiers.
 */

export type SurveyRequestDto = Readonly<
  Record<string, string | number | readonly string[]>
>;

export type RiskResponseDto = Readonly<Record<string, unknown>>;
