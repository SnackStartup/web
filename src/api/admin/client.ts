import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../client'

export type AdminImage = {
  id: string
  position: number
  tile_url: string
  full_url: string
}

export type AdminPlace = {
  id: string
  suffix: string | null
  name: string
  location: string
  instagram_url: string
  facebook_url: string
  description: string
  primary_color: string
  background_opacity: string | null
  color_scheme: 'dark' | 'light' | null
  neon: boolean
  coffee_budget: number
  is_published: boolean
  updated_at: string
  payment_token: string | null
  logo_url: string
  background_url: string
  gallery: AdminImage[]
}

export type PlaceInput = Omit<
  AdminPlace,
  | 'logo_url'
  | 'background_url'
  | 'gallery'
  | 'updated_at'
  | 'payment_token'
>

export type AdminMe = {
  email: string
  environment: 'local' | 'staging' | 'prod'
  assets_public_url: string
  public_web_url: string
}

export type PlaceExport = {
  version: number
  place: PlaceInput
  logo: string | null
  background: string | null
  gallery: string[]
}

export const useAdminMeQuery = () =>
  useQuery({
    queryKey: ['admin', 'me'],
    queryFn: async () => (await apiClient.get<AdminMe>('/admin/me')).data,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

export const useAdminPlacesQuery = () =>
  useQuery({
    queryKey: ['admin', 'places'],
    queryFn: async () =>
      (await apiClient.get<AdminPlace[]>('/admin/places')).data,
  })

export const useAdminPlaceQuery = (id: string) =>
  useQuery({
    queryKey: ['admin', 'place', id],
    queryFn: async () =>
      (await apiClient.get<AdminPlace>(`/admin/places/${id}`)).data,
    enabled: Boolean(id),
    retry: false,
  })

export const savePlace = async (input: PlaceInput, isNew: boolean) => {
  const { id, ...body } = input
  const { data } = isNew
    ? await apiClient.post<AdminPlace>('/admin/places', input)
    : await apiClient.put<AdminPlace>(`/admin/places/${id}`, body)
  return data
}

export const uploadBrand = async (
  placeId: string,
  kind: 'logo' | 'background',
  file: File,
) => {
  const form = new FormData()
  form.append('file', file)
  return (
    await apiClient.post<AdminPlace>(
      `/admin/places/${placeId}/brand/${kind}`,
      form,
    )
  ).data
}

export const uploadGallery = async (placeId: string, files: File[]) => {
  const form = new FormData()
  files.forEach((file) => form.append('files', file))
  return (
    await apiClient.post<AdminImage[]>(
      `/admin/places/${placeId}/gallery`,
      form,
    )
  ).data
}

export const deleteGalleryImage = async (placeId: string, imageId: string) =>
  (
    await apiClient.delete<AdminImage[]>(
      `/admin/places/${placeId}/gallery/${imageId}`,
    )
  ).data

export const reorderGallery = async (placeId: string, ids: string[]) =>
  (
    await apiClient.put<AdminImage[]>(
      `/admin/places/${placeId}/gallery/order`,
      { ids },
    )
  ).data

export const fetchQrBlob = async (
  placeId: string,
  format: 'png' | 'svg',
): Promise<Blob> =>
  (
    await apiClient.get<Blob>(`/admin/places/${placeId}/qr.${format}`, {
      responseType: 'blob',
    })
  ).data

export const exportPlace = async (placeId: string): Promise<PlaceExport> =>
  (await apiClient.get<PlaceExport>(`/admin/places/${placeId}/export`)).data

export const importPlace = async (payload: PlaceExport): Promise<AdminPlace> =>
  (await apiClient.post<AdminPlace>('/admin/places/import', payload)).data

export const rotatePaymentToken = async (placeId: string) =>
  (
    await apiClient.post<AdminPlace>(
      `/admin/places/${placeId}/payment-token`,
    )
  ).data

export const revokePaymentToken = async (placeId: string) =>
  (
    await apiClient.delete<AdminPlace>(
      `/admin/places/${placeId}/payment-token`,
    )
  ).data

export const useDeletePlaceMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) =>
      apiClient.delete(`/admin/places/${id}`, { params: { force: true } }),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: ['place', id] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'places'] })
      void queryClient.invalidateQueries({ queryKey: ['places'] })
    },
  })
}
