import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../client'
import { apiAdminInvalidatePlaceQueries } from './invalidate-place-queries'
import type { ApiAdminImage } from './types'

export const useApiAdminGalleryImagesUploadMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      placeId,
      files,
    }: {
      placeId: string
      files: File[]
    }) => {
      const form = new FormData()
      files.forEach((file) => form.append('files', file))
      const { data } = await apiClient.post<ApiAdminImage[]>(
        `/admin/places/${placeId}/gallery`,
        form,
      )
      return data
    },
    onSuccess: async (_images, { placeId }) => {
      await apiAdminInvalidatePlaceQueries(queryClient, placeId)
    },
  })
}
