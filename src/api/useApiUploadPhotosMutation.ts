import { useMutation } from '@tanstack/react-query'
import { apiClient } from './client'
import { compressImage } from '#/lib/compress-image'
import { usePostHog } from '@posthog/react'

const randomUploadId = () =>
  typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`

export const useApiUploadPhotosMutation = () => {
  const postHog = usePostHog()

  return useMutation({
    retry: 2,
    mutationFn: async ({ files }: { files: File[] }) => {
      postHog.capture('try_upload_photos', { count: files.length })

      const compressed = await Promise.all(files.map(compressImage))

      // one small POST per photo; a dropped connection only fails that photo
      const results = await Promise.allSettled(
        compressed.map((file) => {
          const formData = new FormData()
          formData.append('files', file) // same field name -> backend unchanged
          return apiClient.post('/upload_photos', formData, {
            timeout: 120000,
            headers: { 'X-Upload-Id': randomUploadId() },
          })
        }),
      )

      const failed = results.filter(
        (result): result is PromiseRejectedResult =>
          result.status === 'rejected',
      )
      if (failed.length > 0) {
        const first = failed[0].reason
        const message = `${failed.length} z ${results.length} zdjęć nie zostało wysłanych`
        return Promise.reject(
          first instanceof Error
            ? new Error(message, { cause: first })
            : new Error(message),
        )
      }
      return results
    },
  })
}
