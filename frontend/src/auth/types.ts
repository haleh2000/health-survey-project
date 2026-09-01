export type AuthTokens = {
  accessToken: string
  refreshToken: string
  accessTokenExpiresAt: number
  refreshTokenExpiresAt: number
}

export type AuthUser = {
  id?: string | number
  username: string
  displayName?: string
  email?: string
  avatar?: string | null
  role?: number
  [key: string]: unknown
}

export type AuthSession = {
  user: AuthUser
  tokens: AuthTokens
}

export type LoginPayload = {
  username: string
  password: string
}

export type UpdateProfilePayload = {
  username?: string
  email?: string
  avatar?: string | null
  currentPassword: string
  password?: string
}
