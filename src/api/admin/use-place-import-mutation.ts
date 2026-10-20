import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../client'
import { adminKeys } from '../query-keys'
import type { ApiAdminPlace, ApiPlaceExport } from './types'

export const useApiPlaceImportMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: ApiPlaceExport) =>
      (await apiClient.post<ApiAdminPlace>('/admin/places/import', payload))
        .data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminKeys.places })
    },
  })
}
