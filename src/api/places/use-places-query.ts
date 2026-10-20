import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../client'
import { placeKeys } from '../query-keys'
import type { ApiPlaceSummary } from './types'

export const useApiPlacesQuery = () => {
  return useQuery({
    queryKey: placeKeys.all,
    queryFn: async () =>
      (await apiClient.get<ApiPlaceSummary[]>('/places')).data,
    staleTime: 60 * 60 * 1000,
  })
}
