import type { AppError } from "@core/errors/app-error";

import type { FieldErrors } from "@survey/domain/services/answer-validation.service";

/**
 * Why a submission failed.
 *
 * Split into two cases because the UI reacts differently: local validation
 * sends the user back to the offending step, while a remote failure shows a
 * banner with a retry button.
 */
export type SubmitSurveyFailure =
  | { readonly kind: "invalid"; readonly fieldErrors: FieldErrors }
  | { readonly kind: "remote"; readonly error: AppError };

export const invalidSubmission = (fieldErrors: FieldErrors): SubmitSurveyFailure => ({
  kind: "invalid",
  fieldErrors,
});

export const remoteFailure = (error: AppError): SubmitSurveyFailure => ({
  kind: "remote",
  error,
});
