import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../client'
import { adminKeys } from '../query-keys'
import type { ApiAdminPlace } from './types'

export const useApiAdminPlacesQuery = () =>
  useQuery({
    queryKey: adminKeys.places,
    queryFn: async () =>
      (await apiClient.get<ApiAdminPlace[]>('/admin/places')).data,
  })
