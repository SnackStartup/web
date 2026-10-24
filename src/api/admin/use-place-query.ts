import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../client'
import { adminKeys } from '../query-keys'
import type { ApiAdminPlace } from './types'

export const useApiAdminPlaceQuery = (id: string) =>
  useQuery({
    queryKey: adminKeys.place(id),
    queryFn: async () =>
      (await apiClient.get<ApiAdminPlace>(`/admin/places/${id}`)).data,
    enabled: Boolean(id),
    retry: false,
  })
