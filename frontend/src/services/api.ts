export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:6001'

type ApiRequestOptions = RequestInit & {
  token?: string
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { body, headers, token, ...restOptions } = options
  const shouldSetJsonContentType =
    typeof body === 'string' ||
    (body !== undefined &&
      body !== null &&
      typeof FormData !== 'undefined' &&
      !(body instanceof FormData))

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...restOptions,
    body,
    headers: {
      ...(shouldSetJsonContentType ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  })

  const isJsonResponse = response.headers
    .get('content-type')
    ?.includes('application/json')

  const initBody = isJsonResponse ? ((await response.json()) as unknown) : null

  if (!response.ok) {
    const message =
      extractErrorMessage(initBody) ?? 'درخواست به سرور با خطا مواجه شد.'

    throw new ApiError(message, response.status)
  }

  return initBody as T
}

export async function apiGet<T>(
  endpoint: string,
  token?: string,
  options: Omit<ApiRequestOptions, 'body' | 'headers' | 'token'> = {},
): Promise<T> {
  return apiRequest<T>(endpoint, {
    ...options,
    method: 'GET',
    token,
  })
}

function extractErrorMessage(body: unknown) {
  if (!body || typeof body !== 'object') {
    return null
  }

  const record = body as Record<string, unknown>

  const directMessage = record.message

  if (typeof directMessage === 'string' && directMessage.trim()) {
    return directMessage
  }

  const errorMessage = record.error

  if (typeof errorMessage === 'string' && errorMessage.trim()) {
    return errorMessage
  }

  return null
}


// Add this helper to api.ts
export async function apiGetFile(
  endpoint: string,
  token?: string,
): Promise<{ blob: Blob; fileName: string; contentType: string }> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    // If it fails, try to parse JSON error message
    const errorBody = await response.json().catch(() => ({}));
    const message = errorBody.message || 'خطا در دریافت فایل';
    throw new ApiError(message, response.status);
  }

  const blob = await response.blob();
  const contentType = response.headers.get('content-type') || 'application/octet-stream';
  
  // Extract filename from header
  const contentDisposition = response.headers.get('content-disposition');
  let fileName = 'report.xlsx';
  if (contentDisposition) {
    const match = contentDisposition.match(/filename\*?=['"]?(?:UTF-8'')?([^'";]+)/i);
    if (match?.[1]) fileName = decodeURIComponent(match[1]);
  }

  return { blob, fileName, contentType };
}
