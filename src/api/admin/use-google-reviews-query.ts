import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../client'
import { adminKeys } from '../query-keys'
import type { ApiGoogleReviews } from '../places/types'

// The public route hides unpublished places, so the draft preview reads the same
// payload through the admin route. ``enabled`` waits until the link is saved, when
// the route would answer with an empty payload for a link nobody stored.
export const useApiAdminGoogleReviewsQuery = (
  placeId: string,
  enabled = true,
) => {
  return useQuery({
    queryKey: adminKeys.placeGoogleReviews(placeId),
    queryFn: async () => {
      const { data } = await apiClient.get<ApiGoogleReviews>(
        `/admin/places/${placeId}/google-reviews`,
      )
      return data
    },
    enabled: enabled && Boolean(placeId),
    retry: false,
    staleTime: 60 * 60 * 1000,
  })
}
