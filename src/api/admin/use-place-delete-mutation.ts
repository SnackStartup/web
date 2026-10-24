import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../client'
import { adminKeys, placeKeys } from '../query-keys'

export const useApiAdminPlaceDeleteMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (placeId: string) => {
      await apiClient.delete(`/admin/places/${placeId}`, {
        params: { force: true },
      })
    },
    onSuccess: async (_data, placeId) => {
      queryClient.removeQueries({ queryKey: adminKeys.place(placeId) })
      queryClient.removeQueries({ queryKey: placeKeys.detail(placeId) })
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminKeys.places }),
        queryClient.invalidateQueries({ queryKey: placeKeys.all }),
      ])
    },
  })
}
