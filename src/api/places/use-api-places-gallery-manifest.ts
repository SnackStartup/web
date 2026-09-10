import { useQuery } from '@tanstack/react-query'

export type GalleryManifest = Record<string, number>

export const useApiGalleryManifestQuery = () =>
  useQuery({
    queryKey: ['gallery-manifest'],
    queryFn: async () =>
      (
        await fetch('/gallery-manifest.json')
      ).json() as Promise<GalleryManifest>,
    staleTime: Infinity,
  })
