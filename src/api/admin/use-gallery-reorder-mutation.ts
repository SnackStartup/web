import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../client'
import { apiAdminInvalidatePlaceQueries } from './invalidate-place-queries'
import type { ApiAdminImage } from './types'

export const useApiGalleryReorderMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      placeId,
      imageIds,
    }: {
      placeId: string
      imageIds: string[]
    }) => {
      const { data } = await apiClient.put<ApiAdminImage[]>(
        `/admin/places/${placeId}/gallery/order`,
        { ids: imageIds },
      )
      return data
    },
    onSuccess: async (_images, { placeId }) => {
      await apiAdminInvalidatePlaceQueries(queryClient, placeId)
    },
  })
}
