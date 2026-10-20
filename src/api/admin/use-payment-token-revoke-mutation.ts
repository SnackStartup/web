import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../client'
import { apiAdminInvalidatePlaceQueries } from './invalidate-place-queries'
import type { ApiAdminPlace } from './types'

export const useApiPaymentTokenRevokeMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (placeId: string) =>
      (
        await apiClient.delete<ApiAdminPlace>(
          `/admin/places/${placeId}/payment-token`,
        )
      ).data,
    onSuccess: async (place) => {
      await apiAdminInvalidatePlaceQueries(queryClient, place.id)
    },
  })
}
