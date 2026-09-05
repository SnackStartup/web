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
    retry: 0, // don't re-run the whole batch automatically
    mutationFn: async ({ files }: { files: File[] }) => {
      analyticsCapture('try_upload_photos', { count: files.length })

      const compressed = await Promise.all(files.map(compressImage))
      progressRef.current = new Map()
      files.forEach((f) => progressRef.current.set(f, 0))

      const failed: unknown[] = []
      // Sequential: 6 parallel uploads starve a 100 kbps link and time out.
      for (let i = 0; i < compressed.length; i++) {
        const file = compressed[i]
        const original = files[i]
        const formData = new FormData()
        formData.append('files', file)
        try {
          await apiClient.post('/upload_photos', formData, {
            timeout: 120000,
            'axios-retry': { retries: 1 }, // override client.ts's global 3x retry
            headers: { 'X-Upload-Id': randomUploadId() },
            onUploadProgress: (e) => {
              if (!e.total) return
              const pct = Math.round((e.loaded / e.total) * 100)
              progressRef.current.set(original, pct)
            },
          })
        } catch (error) {
          failed.push(error)
        }
      }

      if (failed.length > 0) {
        throw new Error(
          `${failed.length} z ${files.length} zdjęć nie zostało wysłanych`,
        )
      }
    },
  })

  const getProgress = (file: File) => progressRef.current.get(file) ?? 0

  return { ...mutation, getProgress }
}
