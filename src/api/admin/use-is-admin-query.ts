import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../client'
import { getAccessToken } from '#/stores/auth-token'
import { adminKeys } from '../query-keys'
import type { ApiAdminMe } from './types'

// Guest pages use this to show admin-only shortcuts. It only runs when the
// visitor already has a session, so anonymous guests make no extra request.
export const useApiIsAdminQuery = () =>
  useQuery({
    queryKey: adminKeys.me,
    queryFn: async () => (await apiClient.get<ApiAdminMe>('/admin/me')).data,
    enabled: Boolean(getAccessToken()),
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
