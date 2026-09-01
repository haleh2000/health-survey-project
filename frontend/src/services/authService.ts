import { apiRequest } from './api'
import { normalizeRoleId } from '../auth/role'
import type {
  AuthSession,
  LoginPayload,
  UpdateProfilePayload,
} from '../auth/types'

export const ACCESS_TOKEN_LIFETIME_MINUTES = 15
export const REFRESH_TOKEN_LIFETIME_DAYS = 7
export const ACCESS_TOKEN_REFRESH_BUFFER_SECONDS = 60

type LoginApiResponse = {
  accessToken?: string
  access_token?: string
  refreshToken?: string
  refresh_token?: string
  token?: string
  jwt?: string
  data?: LoginApiResponse
  user?: {
    id?: string | number
    username?: string
    displayName?: string
    name?: string
    fullName?: string
    email?: string
    avatar?: string | null
    role?: number
    [key: string]: unknown
  }
  id?: string | number
  username?: string
  displayName?: string
  name?: string
  fullName?: string
  email?: string
  avatar?: string | null
  role?: number
}

type RefreshApiResponse = Pick<
  LoginApiResponse,
  | 'accessToken'
  | 'access_token'
  | 'refreshToken'
  | 'refresh_token'
  | 'token'
  | 'jwt'
  | 'data'
>

type ProfileApiResponse = LoginApiResponse

export async function login(payload: LoginPayload): Promise<AuthSession> {
  const response = await apiRequest<LoginApiResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  const loginData = response.data ?? response
  const userData = loginData.user ?? loginData
  const accessToken =
    loginData.accessToken ?? loginData.access_token ?? loginData.token ?? loginData.jwt
  const refreshToken = loginData.refreshToken ?? loginData.refresh_token

  if (!accessToken || !refreshToken) {
    throw new Error('پاسخ ورود معتبر نیست و توکن دریافت نشد.')
  }

  const username =
    userData.username?.trim() ||
    loginData.username?.trim() ||
    payload.username.trim()
  const displayName =
    userData.displayName ??
    userData.fullName ??
    userData.name ??
    loginData.displayName ??
    loginData.fullName ??
    loginData.name ??
    username
  const email = userData.email ?? loginData.email
  const avatar = userData.avatar ?? loginData.avatar
  const role = normalizeRoleId(userData.role) ?? 1

  return {
    user: {
      ...userData,
      id: userData.id ?? loginData.id,
      username,
      displayName,
      email,
      avatar,
      role,
    },
    tokens: {
      accessToken,
      refreshToken,
      accessTokenExpiresAt: createAccessTokenExpiresAt(),
      refreshTokenExpiresAt: createRefreshTokenExpiresAt(),
    },
  }
}

export async function refreshAccessToken(
  session: AuthSession,
): Promise<AuthSession> {
  const response = await apiRequest<RefreshApiResponse>('/auth/refresh', {
    method: 'POST',
    token: session.tokens.refreshToken,
  })
  const refreshData = response.data ?? response
  const accessToken =
    refreshData.accessToken ??
    refreshData.access_token ??
    refreshData.token ??
    refreshData.jwt
  const nextRefreshToken = refreshData.refreshToken ?? refreshData.refresh_token
  const refreshToken = nextRefreshToken ?? session.tokens.refreshToken

  if (!accessToken) {
    throw new Error('پاسخ تمدید نشست معتبر نیست و توکن دریافت نشد.')
  }

  return {
    ...session,
    tokens: {
      accessToken,
      refreshToken,
      accessTokenExpiresAt: createAccessTokenExpiresAt(),
      refreshTokenExpiresAt: nextRefreshToken
        ? createRefreshTokenExpiresAt()
        : session.tokens.refreshTokenExpiresAt,
    },
  }
}

export async function updateProfile(
  session: AuthSession,
  payload: UpdateProfilePayload,
): Promise<AuthSession> {
  const response = await apiRequest<ProfileApiResponse>('/auth/me', {
    method: 'PATCH',
    token: session.tokens.accessToken,
    body: JSON.stringify(payload),
  })

  const profileData = response.data ?? response
  const userData = profileData.user ?? profileData
  const accessToken =
    profileData.accessToken ??
    profileData.access_token ??
    profileData.token ??
    profileData.jwt
  const nextRefreshToken =
    profileData.refreshToken ?? profileData.refresh_token
  const refreshToken = nextRefreshToken ?? session.tokens.refreshToken

  if (!accessToken) {
    throw new Error('پاسخ بروزرسانی پروفایل معتبر نیست و توکن دریافت نشد.')
  }

  const username =
    userData.username?.trim() ||
    profileData.username?.trim() ||
    session.user.username
  const displayName =
    userData.displayName ??
    userData.fullName ??
    userData.name ??
    profileData.displayName ??
    profileData.fullName ??
    profileData.name ??
    username
  const email = userData.email ?? profileData.email ?? session.user.email
  const avatar = userData.avatar ?? profileData.avatar ?? session.user.avatar
  const role = normalizeRoleId(userData.role) ?? session.user.role ?? 1

  return {
    user: {
      ...session.user,
      ...userData,
      id: userData.id ?? profileData.id ?? session.user.id,
      username,
      displayName,
      email,
      avatar,
      role,
    },
    tokens: {
      accessToken,
      refreshToken,
      accessTokenExpiresAt: createAccessTokenExpiresAt(),
      refreshTokenExpiresAt: nextRefreshToken
        ? createRefreshTokenExpiresAt()
        : session.tokens.refreshTokenExpiresAt,
    },
  }
}

export function isAccessTokenRefreshNeeded(session: AuthSession) {
  return (
    Date.now() >=
    session.tokens.accessTokenExpiresAt -
      ACCESS_TOKEN_REFRESH_BUFFER_SECONDS * 1000
  )
}

export function isRefreshTokenExpired(session: AuthSession) {
  return Date.now() >= session.tokens.refreshTokenExpiresAt
}

function createAccessTokenExpiresAt() {
  return Date.now() + ACCESS_TOKEN_LIFETIME_MINUTES * 60 * 1000
}

function createRefreshTokenExpiresAt() {
  return Date.now() + REFRESH_TOKEN_LIFETIME_DAYS * 24 * 60 * 60 * 1000
}
