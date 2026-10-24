import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../client'
import { placeKeys } from '../query-keys'
import type { ApiPlace } from './types'

export const useApiPlaceQuery = (placeId: string) => {
  return useQuery({
    queryKey: placeKeys.detail(placeId),
    queryFn: async () => {
      const { data } = await apiClient.get<ApiPlace>(`/places/${placeId}`)
      return data
    },
    enabled: Boolean(placeId),
    retry: false,
    staleTime: 60 * 60 * 1000,
  })
}
