import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../client'
import { adminKeys } from '../query-keys'
import type { ApiAdminMe } from './types'

export const useApiAdminMeQuery = () =>
  useQuery({
    queryKey: adminKeys.me,
    queryFn: async () => (await apiClient.get<ApiAdminMe>('/admin/me')).data,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
