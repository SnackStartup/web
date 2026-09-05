import { useMutation } from '@tanstack/react-query'
import { useRef } from 'react'
import { apiClient } from './client'
import { compressImage } from '#/lib/compress-image'
import { analyticsCapture } from '#/lib/analytics'

const randomUploadId = () =>
  typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`

export const useApiUploadPhotosMutation = () => {
  const progressRef = useRef<Map<File, number>>(new Map())

  const mutation = useMutation({
    retry: 2,
    mutationFn: async ({ files }: { files: File[] }) => {
      analyticsCapture('try_upload_photos', { count: files.length })

      const compressed = await Promise.all(files.map(compressImage))
      progressRef.current = new Map()
      files.forEach((f) => progressRef.current.set(f, 0))

      const results = await Promise.allSettled(
        compressed.map((file, i) => {
          const original = files[i]
          const formData = new FormData()
          formData.append('files', file)
          return apiClient.post('/upload_photos', formData, {
            timeout: 120000,
            headers: { 'X-Upload-Id': randomUploadId() },
            onUploadProgress: (e) => {
              if (!e.total) return
              const pct = Math.round((e.loaded / e.total) * 100)
              progressRef.current.set(original, pct)
            },
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

  const getProgress = (file: File) => progressRef.current.get(file) ?? 0

  return { ...mutation, getProgress }
}
