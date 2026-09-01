import type { AuthSession } from './types'

const AUTH_STORAGE_KEY = 'health-survey-auth-session'

export function loadSession(): AuthSession | null {
  try {
    const rawValue = window.localStorage.getItem(AUTH_STORAGE_KEY)

    if (!rawValue) {
      return null
    }

    const session = JSON.parse(rawValue) as AuthSession

    if (
      !session.tokens?.accessToken ||
      !session.tokens.refreshToken ||
      !session.tokens.accessTokenExpiresAt ||
      !session.tokens.refreshTokenExpiresAt
    ) {
      clearSession()
      return null
    }

    return session
  } catch {
    return null
  }
}

export function persistSession(session: AuthSession) {
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
}

export function clearSession() {
  window.localStorage.removeItem(AUTH_STORAGE_KEY)
}
