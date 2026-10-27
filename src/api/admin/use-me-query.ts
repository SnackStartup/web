import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../client'
import { adminKeys } from '../query-keys'
import { useAuthTokenStore } from '#/stores/auth-token'
import type { ApiAdminMe } from './types'

export const useApiAdminMeQuery = () => {
  // Subscribed to, so signing out turns the query off instead of firing a
  // request with no token. With no data the layout renders the sign-in gate.
  const accessToken = useAuthTokenStore((state) => state.accessToken)

  return useQuery({
    queryKey: adminKeys.me,
    queryFn: async () => (await apiClient.get<ApiAdminMe>('/admin/me')).data,
    enabled: accessToken !== null,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
}
