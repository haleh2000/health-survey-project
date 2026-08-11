export type SurveyRequestDto = Readonly<
  Record<string, string | number | readonly string[]>
>;

export type RiskResponseDto = Readonly<Record<string, unknown>>;
