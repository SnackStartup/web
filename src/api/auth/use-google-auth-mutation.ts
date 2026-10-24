import { useMutation } from '@tanstack/react-query'
import { apiClient } from '../client'
import { setTokens } from '#/lib/auth-token'

export type GoogleUser = {
  id: string
  email: string
  name: string
  picture: string
}

export type AuthResponse = GoogleUser & {
  access_token: string
  refresh_token: string
  expires_in: number
}

export const useApiGoogleAuthMutation = () => {
  return useMutation({
    mutationFn: async ({ idToken }: { idToken: string }) => {
      const { data } = await apiClient.post<AuthResponse>('/auth/google', {
        id_token: idToken,
      })
      setTokens(data)
      return data
    },
  })
}
