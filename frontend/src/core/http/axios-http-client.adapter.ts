import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";

import {
  networkError,
  serverError,
  timeoutError,
  unknownError,
  validationError,
  type AppError,
} from "@core/errors/app-error";
import type { HttpClient } from "@core/http/http-client.port";
import { err, ok, type Result } from "@core/result/result";
import { clearSession, loadSession, persistSession } from "../../auth/storage";
import { refreshAccessToken } from "../../services/authService";

type RetryableConfig = InternalAxiosRequestConfig & { __isAuthRetry?: boolean };

/** The error envelope both FastAPI handlers in `backend/main.py` produce. */
interface BackendErrorBody {
  readonly detail?: string;
  readonly errors?: readonly {
    readonly loc?: readonly (string | number)[];
    readonly msg?: string;
  }[];
}

/**
 * FastAPI reports the offending field as `loc: ["body", "<persian alias>"]`.
 * We keep the alias as the key; the repository translates it back into a
 * question id, because only that layer knows the alias mapping.
 */
const toFieldErrors = (
  body: BackendErrorBody,
): Record<string, string> | undefined => {
  if (!body.errors?.length) return undefined;

  const fieldErrors: Record<string, string> = {};

  for (const entry of body.errors) {
    const field = entry.loc?.at(-1);
    if (typeof field !== "string" || field === "body") continue;
    fieldErrors[field] = entry.msg ?? "مقدار وارد شده معتبر نیست.";
  }

  return Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined;
};

const translate = (error: unknown): AppError => {
  if (!(error instanceof AxiosError)) return unknownError(error);

  if (error.code === AxiosError.ECONNABORTED || error.code === AxiosError.ETIMEDOUT) {
    return timeoutError(error);
  }

  const response = error.response;
  if (!response) return networkError(error);

  const body = (response.data ?? {}) as BackendErrorBody;

  if (response.status === 422 || response.status === 400) {
    const fields = toFieldErrors(body);
    return fields
      ? validationError(body.detail ?? "اطلاعات ارسالی معتبر نیست.", fields)
      : validationError(body.detail ?? "اطلاعات ارسالی معتبر نیست.");
  }

  return serverError(response.status, body.detail, error);
};

/** Adapts Axios to the `HttpClient` port. The only file allowed to import axios. */
export class AxiosHttpClient implements HttpClient {
  private readonly instance: AxiosInstance;

  constructor(baseURL: string, timeoutMs: number) {
    this.instance = axios.create({
      baseURL,
      timeout: timeoutMs,
      headers: { "Content-Type": "application/json" },
    });

    // Every survey/history request must carry the Didar session's access
    // token; read it fresh per request rather than snapshotting it once.
    this.instance.interceptors.request.use((config) => {
      const token = loadSession()?.tokens.accessToken;
      if (token) config.headers.set("Authorization", `Bearer ${token}`);
      return config;
    });

    // A single retry after refreshing the access token; if that also fails
    // the session is gone, so the local session is cleared and the app
    // shell (listening for this event) falls back to the login screen.
    this.instance.interceptors.response.use(
      (response) => response,
      async (error: unknown) => {
        if (!(error instanceof AxiosError) || error.response?.status !== 401) {
          return Promise.reject(error);
        }

        const config = error.config as RetryableConfig | undefined;
        if (!config || config.__isAuthRetry) return Promise.reject(error);

        const session = loadSession();
        if (!session) return Promise.reject(error);

        try {
          const refreshed = await refreshAccessToken(session.tokens.refreshToken);
          persistSession({
            ...session,
            tokens: {
              ...session.tokens,
              accessToken: refreshed.access_token,
              accessTokenExpiresAt: refreshed.access_token_expires_at,
            },
          });

          config.__isAuthRetry = true;
          config.headers.set("Authorization", `Bearer ${refreshed.access_token}`);
          return this.instance.request(config);
        } catch {
          clearSession();
          window.dispatchEvent(new Event("auth:session-cleared"));
          return Promise.reject(error);
        }
      },
    );
  }

  async get<TResponse>(
    path: string,
  ): Promise<Result<TResponse, AppError>> {
    try {
      const response = await this.instance.get<TResponse>(path);
      return ok(response.data);
    } catch (error) {
      return err(translate(error));
    }
  }

  async post<TResponse>(
    path: string,
    body: unknown,
  ): Promise<Result<TResponse, AppError>> {
    try {
      const response = await this.instance.post<TResponse>(path, body);
      return ok(response.data);
    } catch (error) {
      return err(translate(error));
    }
  }
}
