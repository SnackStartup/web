import { useMutation } from '@tanstack/react-query'
import { apiClient } from '../client'
import type { UploadResponse } from '../photos/use-api-photos-upload-mutation'

export const useApiClaimMutation = () => {
  return useMutation({
    mutationFn: async ({
      placeId,
      uploadId,
    }: {
      placeId: string
      uploadId: string
    }) => {
      const { data } = await apiClient.post<UploadResponse>('/auth/claim', {
        place_id: placeId,
        upload_id: uploadId,
      })
      return data
    },
  })
}
