import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../client'
import { getAccessToken } from '#/lib/auth-token'
import type { AdminMe } from './client'

// Guest pages use this to show admin-only shortcuts. It only runs when the
// visitor already has a session, so anonymous guests make no extra request.
export const useIsAdminQuery = () =>
  useQuery({
    queryKey: ['admin', 'me'],
    queryFn: async () => (await apiClient.get<AdminMe>('/admin/me')).data,
    enabled: Boolean(getAccessToken()),
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
