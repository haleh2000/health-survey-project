import type { AppError } from "@core/errors/app-error";
import type { Result } from "@core/result/result";

/**
 * The outbound HTTP port.
 *
 * Repositories depend on this interface, never on Axios directly, so the
 * transport can be swapped (fetch, a mock, a retrying decorator) without any
 * change above this line.
 */
export interface HttpClient {
  get<TResponse>(path: string): Promise<Result<TResponse, AppError>>;
  post<TResponse>(
    path: string,
    body: unknown,
  ): Promise<Result<TResponse, AppError>>;
}
