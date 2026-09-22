import { ENV } from '@core/config/env'

import type { AuthSession } from '../auth/types'

export class DidarAuthError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'DidarAuthError'
    this.status = status
  }
}

type ErrorBody = { detail?: string }

async function post<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${ENV.apiUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (response.status === 204) {
    return undefined as T
  }

  const isJson = response.headers.get('content-type')?.includes('application/json')
  const data = isJson ? ((await response.json()) as unknown) : null

  if (!response.ok) {
    const message =
      data && typeof data === 'object' && typeof (data as ErrorBody).detail === 'string'
        ? (data as ErrorBody).detail!
        : 'درخواست به سرور با خطا مواجه شد.'

    throw new DidarAuthError(message, response.status)
  }

  return data as T
}

async function get<T>(path: string, accessToken: string): Promise<T> {
  const response = await fetch(`${ENV.apiUrl}${path}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  const isJson = response.headers.get('content-type')?.includes('application/json')
  const data = isJson ? ((await response.json()) as unknown) : null

  if (!response.ok) {
    const message =
      data && typeof data === 'object' && typeof (data as ErrorBody).detail === 'string'
        ? (data as ErrorBody).detail!
        : 'درخواست به سرور با خطا مواجه شد.'

    throw new DidarAuthError(message, response.status)
  }

  return data as T
}

export type MobileStepResponse = {
  session_id: string
  captcha_required: boolean
  captcha: string | null
  registered: boolean | null
}

export type OtpSendResponse = {
  session_id: string
  expires_in?: number
}

export type RegisterIdentityResponse = {
  session_id: string
  first_name: string
  last_name: string
  father_name?: string
  national_id: string
  mobile?: string
}

export type AuthMe = {
  national_id: string
  full_name: string | null
  mobile: string | null
}

export type AuthSessionResponse = {
  access_token: string
  access_token_expires_at: number
  refresh_token: string
  refresh_token_expires_at: number
  user: AuthMe
}

export type RefreshResponse = {
  access_token: string
  access_token_expires_at: number
}

export function toSession(response: AuthSessionResponse): AuthSession {
  return {
    user: response.user,
    tokens: {
      accessToken: response.access_token,
      accessTokenExpiresAt: response.access_token_expires_at,
      refreshToken: response.refresh_token,
      refreshTokenExpiresAt: response.refresh_token_expires_at,
    },
  }
}

/** Resolves the captcha into a usable `<img>` source, if one was returned. */
export function captchaImageSrc(captcha: string): string {
  return captcha.startsWith('data:') ? captcha : `data:image/png;base64,${captcha}`
}

export function requestMobileStep(payload: {
  mobile: string
  session_id?: string
  captcha?: string
}): Promise<MobileStepResponse> {
  return post('/auth/didar/mobile', payload)
}

export function sendOtp(session_id: string): Promise<OtpSendResponse> {
  return post('/auth/didar/otp/send', { session_id })
}

export function verifyOtp(session_id: string, code: string): Promise<AuthSessionResponse> {
  return post('/auth/didar/otp/verify', { session_id, code })
}

export function loginWithPassword(
  session_id: string,
  password: string,
): Promise<AuthSessionResponse> {
  return post('/auth/didar/password', { session_id, password })
}

export function registerIdentity(
  session_id: string,
  national_id: string,
  birth_date: string,
): Promise<RegisterIdentityResponse> {
  return post('/auth/didar/register/identity', { session_id, national_id, birth_date })
}

export function completeRegistration(
  session_id: string,
  password: string,
  password_confirm: string,
): Promise<AuthSessionResponse> {
  return post('/auth/didar/register', { session_id, password, password_confirm })
}

export function refreshAccessToken(refresh_token: string): Promise<RefreshResponse> {
  return post('/auth/refresh', { refresh_token })
}

export function logout(refresh_token: string): Promise<void> {
  return post('/auth/logout', { refresh_token })
}

export function fetchMe(accessToken: string): Promise<AuthMe> {
  return get('/auth/me', accessToken)
}
