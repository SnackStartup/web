import { useMutation } from '@tanstack/react-query'
import { apiClient } from './client'

export const useApiUploadPhotosMutation = () => {
  return useMutation({
    mutationFn: async ({ files }: { files: File[] }) => {
      const formData = new FormData()
      for (const file of files) {
        formData.append('files', file)
      }
      return apiClient.post('/upload_photos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    },
  })
}
