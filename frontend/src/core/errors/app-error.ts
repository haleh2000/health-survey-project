/**
 * Every failure that can cross a layer boundary, as one closed union.
 *
 * Adapters translate whatever their library throws (an Axios error, a DOM
 * exception) into one of these, so the layers above never have to know which
 * HTTP library is in use. `message` is already user-facing Persian.
 */

export const ErrorKind = {
  Network: "network",
  Timeout: "timeout",
  Validation: "validation",
  Server: "server",
  Unknown: "unknown",
} as const;

export type ErrorKind = (typeof ErrorKind)[keyof typeof ErrorKind];

export interface AppError {
  readonly kind: ErrorKind;
  /** Safe to render directly to the user. */
  readonly message: string;
  /** HTTP status, when the failure came from a response. */
  readonly status?: number;
  /** Field-level detail, keyed by question id, for validation failures. */
  readonly fieldErrors?: Readonly<Record<string, string>>;
  /** Original throwable, kept for logging only — never rendered. */
  readonly cause?: unknown;
}

const build = (
  kind: ErrorKind,
  message: string,
  extra: Omit<AppError, "kind" | "message"> = {},
): AppError => ({ kind, message, ...extra });

export const networkError = (cause?: unknown): AppError =>
  build(ErrorKind.Network, "ارتباط با سرور برقرار نشد. اتصال اینترنت خود را بررسی کنید.", { cause });

export const timeoutError = (cause?: unknown): AppError =>
  build(ErrorKind.Timeout, "پاسخی از سرور دریافت نشد. لطفاً دوباره تلاش کنید.", { cause });

export const validationError = (
  message: string,
  fieldErrors?: Readonly<Record<string, string>>,
): AppError =>
  fieldErrors
    ? build(ErrorKind.Validation, message, { status: 422, fieldErrors })
    : build(ErrorKind.Validation, message, { status: 422 });

export const serverError = (status: number, message?: string, cause?: unknown): AppError =>
  build(ErrorKind.Server, message ?? "خطای داخلی سرور رخ داده است. لطفاً مجدداً تلاش کنید.", {
    status,
    cause,
  });

export const unknownError = (cause?: unknown): AppError =>
  build(ErrorKind.Unknown, "خطای پیش‌بینی‌نشده‌ای رخ داد.", { cause });
