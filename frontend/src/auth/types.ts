export type AuthUser = {
  national_id: string
  full_name: string | null
  mobile: string | null
}

export type AuthTokens = {
  accessToken: string
  accessTokenExpiresAt: number
  refreshToken: string
  refreshTokenExpiresAt: number
}

export type AuthSession = {
  user: AuthUser
  tokens: AuthTokens
}
