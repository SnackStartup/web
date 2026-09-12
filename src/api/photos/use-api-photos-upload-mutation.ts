import { useMutation } from '@tanstack/react-query'
import { useRef } from 'react'
import { apiClient } from '../client'
import { compressImage } from '#/lib/compress-image'
import { analyticsCapture } from '#/lib/analytics'
import { getFingerprint } from '#/lib/fingerprint'

export type FreeCoffeeReason =
  'granted' | 'already_redeemed' | 'budget_exhausted'

export type UploadResponse = {
  uploaded: number
  upload_id: string | null
  free_coffee: boolean
  reason: FreeCoffeeReason | null
  budget_remaining: number | null
}

export type UploadMutationResult = {
  result: UploadResponse | null
  uploadId: string | null
}

export const useApiPhotosUploadMutation = () => {
  const progressRef = useRef<Map<File, number>>(new Map())
  const compressedFilesRef = useRef<File[]>([])

  const mutation = useMutation({
    retry: 0,
    mutationFn: async ({
      files,
      placeId,
    }: {
      files: File[]
      placeId: string
    }): Promise<UploadMutationResult> => {
      analyticsCapture('upload_photos', { count: files.length })

      const compressed = await Promise.all(files.map(compressImage))
      compressedFilesRef.current = compressed
      progressRef.current = new Map()
      files.forEach((f) => progressRef.current.set(f, 0))

      const device = await getFingerprint() // kept, sent as device id
      const failed: unknown[] = []
      let lastResult: UploadResponse | null = null
      let uploadId: string | null = null

      for (let i = 0; i < compressed.length; i++) {
        const file = compressed[i]
        const original = files[i]
        const formData = new FormData()
        formData.append('files', file)
        formData.append('place_id', placeId)
        formData.append('device', device)
        try {
          const { data } = await apiClient.post<UploadResponse>(
            '/photos/upload',
            formData,
            {
              timeout: 120000,
              'axios-retry': { retries: 1 },
              onUploadProgress: (e) => {
                if (!e.total) return
                const pct = Math.round((e.loaded / e.total) * 100)
                progressRef.current.set(original, pct)
              },
            },
          )
          lastResult = data
          uploadId = data.upload_id ?? uploadId
        } catch (error) {
          failed.push(error)
        }
      }

      if (failed.length > 0) {
        throw new Error(
          `${failed.length} z ${files.length} zdjęć nie zostało wysłanych`,
        )
      }

      return { result: lastResult, uploadId }
    },
  })

  const getProgress = (file: File) => progressRef.current.get(file) ?? 0
  const getCompressedFiles = () => compressedFilesRef.current

  return { ...mutation, getProgress, getCompressedFiles }
}
