import type { QueryClient } from '@tanstack/react-query'
import { adminKeys, placeKeys } from '../query-keys'

// A write touches both the admin views and the public guest page, so every
// place mutation refreshes all four caches.
export const apiAdminInvalidatePlaceQueries = async (
  queryClient: QueryClient,
  placeId: string,
) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: adminKeys.place(placeId) }),
    queryClient.invalidateQueries({ queryKey: adminKeys.places }),
    queryClient.invalidateQueries({ queryKey: placeKeys.detail(placeId) }),
    queryClient.invalidateQueries({ queryKey: placeKeys.all }),
  ])
}
