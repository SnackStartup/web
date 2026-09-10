import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../client'
import type { ApiPlace } from './types'

export const useApiPlaceQuery = (placeId: string) => {
  return useQuery({
    queryKey: ['place', placeId],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiPlace>(`/places/${placeId}`)
      return data
    },
    enabled: Boolean(placeId),
    retry: false,
    staleTime: 60 * 60 * 1000,
  })
}
