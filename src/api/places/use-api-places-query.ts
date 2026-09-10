import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../client'
import type { ApiPlaceSummary } from './types'

export const useApiPlacesQuery = () => {
  return useQuery({
    queryKey: ['places'],
    queryFn: async () =>
      (await apiClient.get<ApiPlaceSummary[]>('/places')).data,
    staleTime: 60 * 60 * 1000,
  })
}
