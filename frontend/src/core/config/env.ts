/**
 * The single place that reads `import.meta.env`.
 *
 * Validated once at module load so a misconfigured deployment fails loudly at
 * startup instead of producing a `undefined/calculate_risk` request later.
 */

const readApiUrl = (): string => {
  const raw = import.meta.env.VITE_API_URL?.trim();

  if (raw) return raw.replace(/\/+$/, "");

  if (import.meta.env.DEV) {
    // Matches the uvicorn default the backend README documents.
    return "http://127.0.0.1:8000";
  }

  throw new Error(
    "VITE_API_URL is not set. Define it in .env.production before building.",
  );
};

export const ENV = {
  apiUrl: readApiUrl(),
  requestTimeoutMs: 15_000,
  isDev: import.meta.env.DEV,
} as const;
