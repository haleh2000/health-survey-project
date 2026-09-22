import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'

import {
  logout as logoutRequest,
  refreshAccessToken as refreshRequest,
  toSession,
  type AuthSessionResponse,
} from '../services/authService'
import { clearSession, loadSession, persistSession } from './storage'
import type { AuthSession } from './types'

const ACCESS_TOKEN_REFRESH_BUFFER_MS = 60_000

type AuthContextValue = {
  session: AuthSession | null
  user: AuthSession['user'] | null
  isAuthenticated: boolean
  completeLogin: (response: AuthSessionResponse) => void
  logout: () => void
  getAccessToken: () => string | null
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(() => loadSession())

  const completeLogin = useCallback((response: AuthSessionResponse) => {
    const nextSession = toSession(response)
    persistSession(nextSession)
    setSession(nextSession)
  }, [])

  const logout = useCallback(() => {
    const current = loadSession()
    clearSession()
    setSession(null)

    if (current?.tokens.refreshToken) {
      void logoutRequest(current.tokens.refreshToken).catch(() => undefined)
    }
  }, [])

  // Refreshes the access token ahead of expiry; a failed refresh means the
  // refresh token itself is gone, so the only correct move is to sign out.
  const refreshSession = useCallback(async () => {
    const current = loadSession()

    if (!current || Date.now() >= current.tokens.refreshTokenExpiresAt) {
      clearSession()
      setSession(null)
      return
    }

    try {
      const response = await refreshRequest(current.tokens.refreshToken)
      const nextSession: AuthSession = {
        ...current,
        tokens: {
          ...current.tokens,
          accessToken: response.access_token,
          accessTokenExpiresAt: response.access_token_expires_at,
        },
      }
      persistSession(nextSession)
      setSession(nextSession)
    } catch {
      clearSession()
      setSession(null)
    }
  }, [])

  // The Axios client clears the session and fires this when a 401 survives
  // a refresh attempt; sync the in-memory session so the app falls back to
  // the login screen without a manual reload.
  useEffect(() => {
    const handleSessionCleared = () => setSession(null)
    window.addEventListener('auth:session-cleared', handleSessionCleared)
    return () => window.removeEventListener('auth:session-cleared', handleSessionCleared)
  }, [])

  useEffect(() => {
    if (!session) return undefined

    if (Date.now() >= session.tokens.refreshTokenExpiresAt) {
      window.setTimeout(() => void refreshSession(), 0)
      return undefined
    }

    const refreshDelay = Math.max(
      session.tokens.accessTokenExpiresAt - ACCESS_TOKEN_REFRESH_BUFFER_MS - Date.now(),
      0,
    )
    const refreshTimer = window.setTimeout(() => void refreshSession(), refreshDelay)

    return () => window.clearTimeout(refreshTimer)
  }, [session, refreshSession])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isAuthenticated: Boolean(session?.tokens.accessToken),
      completeLogin,
      logout,
      getAccessToken: () => loadSession()?.tokens.accessToken ?? null,
    }),
    [session, completeLogin, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthContext }
