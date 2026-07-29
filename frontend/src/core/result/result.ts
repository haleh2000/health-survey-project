/**
 * An explicit success/failure value.
 *
 * Use cases return `Result` instead of throwing, so every caller is forced by
 * the type checker to handle the failure path. Exceptions stay reserved for
 * genuine programmer errors (a violated invariant), not for expected outcomes
 * such as "the network is down" or "this answer is invalid".
 */
export type Result<T, E> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });

export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

export const isOk = <T, E>(
  result: Result<T, E>,
): result is { ok: true; value: T } => result.ok;

export const isErr = <T, E>(
  result: Result<T, E>,
): result is { ok: false; error: E } => !result.ok;

/** Applies `fn` to a success value, leaving a failure untouched. */
export const mapResult = <T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U,
): Result<U, E> => (result.ok ? ok(fn(result.value)) : result);
