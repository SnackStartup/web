import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../client'
import { zApiWalletPassSchema } from './types'

export const useApiWalletQuery = ({ enabled }: { enabled: boolean }) => {
  return useQuery({
    enabled,
    queryKey: ['wallet'],
    queryFn: async () => {
      const { data } = await apiClient.get('/wallet/pass')
      return zApiWalletPassSchema.parse(data)
    },
    retry: false,
    staleTime: 0,
  })
}
