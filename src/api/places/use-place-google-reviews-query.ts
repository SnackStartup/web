import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../client'
import { placeKeys } from '../query-keys'
import type { ApiGoogleReviews } from './types'

// Fetched with the page, so the rating shows at once and the dialog loads nothing.
export const useApiPlaceGoogleReviewsQuery = (placeId: string) => {
  return useQuery({
    queryKey: placeKeys.googleReviews(placeId),
    queryFn: async () => {
      const { data } = await apiClient.get<ApiGoogleReviews>(
        `/places/${placeId}/google-reviews`,
      )
      return data
    },
    enabled: Boolean(placeId),
    retry: false,
    staleTime: 60 * 60 * 1000,
  })
}
