import { apiRequest } from './api'

type SupersetGuestTokenResponse = {
  token: string
}

export async function getSupersetGuestToken(dashboardId: string) {
  const response = await apiRequest<SupersetGuestTokenResponse>(
    '/superset/guest-token',
    {
      method: 'POST',
      body: JSON.stringify({ dashboardId }),
    },
  )

  return response.token
}
