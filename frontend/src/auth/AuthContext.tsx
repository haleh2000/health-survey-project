import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import {
  ACCESS_TOKEN_REFRESH_BUFFER_SECONDS,
  isAccessTokenRefreshNeeded,
  isRefreshTokenExpired,
  login as loginRequest,
  refreshAccessToken,
  updateProfile as updateProfileRequest,
} from '../services/authService'
import { clearSession, loadSession, persistSession } from './storage'
import type { AuthSession, LoginPayload, UpdateProfilePayload } from './types'

type AuthContextValue = {
  session: AuthSession | null
  user: AuthSession['user'] | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (payload: LoginPayload) => Promise<void>
  updateProfile: (payload: UpdateProfilePayload) => Promise<AuthSession>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(() => loadSession())
  const [isLoading, setIsLoading] = useState(false)

  const login = useCallback(async (payload: LoginPayload) => {
    setIsLoading(true)

    try {
      const nextSession = await loginRequest(payload)
      persistSession(nextSession)
      setSession(nextSession)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateProfile = useCallback(
    async (payload: UpdateProfilePayload) => {
      if (!session) {
        throw new Error('No active session')
      }

      setIsLoading(true)

      try {
        const nextSession = await updateProfileRequest(session, payload)
        persistSession(nextSession)
        setSession(nextSession)
        return nextSession
      } finally {
        setIsLoading(false)
      }
    },
    [session],
  )

  const logout = useCallback(() => {
    clearSession()
    setSession(null)
  }, [])

  const refreshSession = useCallback(async () => {
    setIsLoading(true)

    try {
      setSession((currentSession) => {
        if (!currentSession || isRefreshTokenExpired(currentSession)) {
          clearSession()
          return null
        }

        return currentSession
      })

      const currentSession = loadSession()

      if (!currentSession || isRefreshTokenExpired(currentSession)) {
        clearSession()
        setSession(null)
        return
      }

      const nextSession = await refreshAccessToken(currentSession)
      persistSession(nextSession)
      setSession(nextSession)
    } catch {
      clearSession()
      setSession(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!session) {
      return undefined
    }

    if (isRefreshTokenExpired(session)) {
      window.setTimeout(() => void refreshSession(), 0)
      return undefined
    }

    if (isAccessTokenRefreshNeeded(session)) {
      window.setTimeout(() => void refreshSession(), 0)
      return undefined
    }

    const refreshDelay = Math.max(
      session.tokens.accessTokenExpiresAt -
        ACCESS_TOKEN_REFRESH_BUFFER_SECONDS * 1000 -
        Date.now(),
      0,
    )
    const refreshTimer = window.setTimeout(() => {
      void refreshSession()
    }, refreshDelay)

    const logoutDelay = Math.max(session.tokens.refreshTokenExpiresAt - Date.now(), 0)
    const logoutTimer = window.setTimeout(() => {
      void refreshSession()
    }, logoutDelay)

    return () => {
      window.clearTimeout(refreshTimer)
      window.clearTimeout(logoutTimer)
    }
  }, [logout, refreshSession, session])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isAuthenticated: Boolean(session?.tokens.accessToken),
      isLoading,
      login,
      updateProfile,
      logout,
    }),
    [isLoading, login, logout, session, updateProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthContext }
