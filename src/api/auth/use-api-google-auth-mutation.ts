import { useMutation } from '@tanstack/react-query'
import { apiClient } from '../client'

export type GoogleUser = {
  id: string
  email: string
  name: string
  picture: string
}

export const useApiGoogleAuthMutation = () => {
  return useMutation({
    mutationFn: async ({ idToken }: { idToken: string }) => {
      const { data } = await apiClient.post<GoogleUser>('/auth/google', {
        id_token: idToken,
      })
      return data
    },
  })
}
