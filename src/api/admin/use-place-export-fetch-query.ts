import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../client'
import { adminKeys } from '../query-keys'
import type { ApiPlaceExport } from './types'

// Export is an on-demand read: the editor renders the query disabled and calls
// refetch() when the button is pressed, so the payload is cached per place.
export const useApiAdminPlaceExportFetchQuery = (
  placeId: string,
  enabled = false,
) =>
  useQuery({
    queryKey: adminKeys.placeExport(placeId),
    queryFn: async () =>
      (await apiClient.get<ApiPlaceExport>(`/admin/places/${placeId}/export`))
        .data,
    enabled,
  })
