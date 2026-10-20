import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../client'
import { apiAdminInvalidatePlaceQueries } from './invalidate-place-queries'
import type { ApiAdminImage } from './types'

export const useApiGalleryImageDeleteMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      placeId,
      imageId,
    }: {
      placeId: string
      imageId: string
    }) => {
      const { data } = await apiClient.delete<ApiAdminImage[]>(
        `/admin/places/${placeId}/gallery/${imageId}`,
      )
      return data
    },
    onSuccess: async (_images, { placeId }) => {
      await apiAdminInvalidatePlaceQueries(queryClient, placeId)
    },
  })
}
