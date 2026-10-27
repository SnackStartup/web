import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../client'
import { adminKeys } from '../query-keys'
import { getRefreshToken, useAuthTokenStore } from '#/stores/auth-token'

export const useApiLogoutMutation = () => {
  const queryClient = useQueryClient()
  const clearTokens = useAuthTokenStore((state) => state.clearTokens)
  return useMutation({
    mutationFn: async () => {
      const refreshToken = getRefreshToken()
      if (!refreshToken) return
      try {
        await apiClient.post('/auth/logout', { refresh_token: refreshToken })
      } catch {
        // The local session is cleared either way.
      }
    },
    onSettled: () => {
      clearTokens()
      queryClient.removeQueries({ queryKey: adminKeys.all })
    },
  })
}
