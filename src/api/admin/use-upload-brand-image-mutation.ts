import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../client'
import { apiAdminInvalidatePlaceQueries } from './invalidate-place-queries'
import type { ApiAdminPlace } from './types'

export const useApiUploadBrandImageMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      placeId,
      kind,
      file,
    }: {
      placeId: string
      kind: 'logo' | 'background'
      file: File
    }) => {
      const form = new FormData()
      form.append('file', file)
      const { data } = await apiClient.post<ApiAdminPlace>(
        `/admin/places/${placeId}/brand/${kind}`,
        form,
      )
      return data
    },
    onSuccess: async (place) => {
      await apiAdminInvalidatePlaceQueries(queryClient, place.id)
    },
  })
}
