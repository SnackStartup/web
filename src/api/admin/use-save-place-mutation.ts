import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../client'
import { apiAdminInvalidatePlaceQueries } from './invalidate-place-queries'
import type { ApiAdminPlace, ApiAdminPlaceInput } from './types'

export const useApiSavePlaceMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      place,
      isNew,
    }: {
      place: ApiAdminPlaceInput
      isNew: boolean
    }) => {
      const { id, ...body } = place
      const { data } = isNew
        ? await apiClient.post<ApiAdminPlace>('/admin/places', place)
        : await apiClient.put<ApiAdminPlace>(`/admin/places/${id}`, body)
      return data
    },
    onSuccess: async (place) => {
      await apiAdminInvalidatePlaceQueries(queryClient, place.id)
    },
  })
}
