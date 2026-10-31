import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../client'
import { adminKeys } from '../query-keys'
import type { ApiGooglePlaceSearchResult } from './types'

// Keyed by the term: the debounced input drives it and earlier terms stay cached
// while the admin types.
export const useApiAdminGooglePlacesSearchQuery = (query: string) => {
  const term = query.trim()
  return useQuery({
    queryKey: adminKeys.googlePlacesSearch(term),
    queryFn: async () => {
      const { data } = await apiClient.get<ApiGooglePlaceSearchResult[]>(
        '/admin/google/places/search',
        {
          params: { q: term },
          // Each retry is a billed Text Search call, so a Google outage must not
          // become four.
          'axios-retry': { retries: 0 },
        },
      )
      return data
    },
    enabled: term.length >= 2,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
}
