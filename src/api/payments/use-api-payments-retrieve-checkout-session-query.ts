import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../client'
import type { ApiCheckoutSessionDetails } from './types'

export const useApiPaymentsRetrieveCheckoutSessionQuery = (
  sessionId: string,
) => {
  return useQuery({
    queryKey: ['checkout-session', sessionId],
    queryFn: async () => {
      return (
        await apiClient.get<ApiCheckoutSessionDetails>(
          `/payments/checkout-session/${sessionId}`,
        )
      ).data
    },
    enabled: Boolean(sessionId),
    retry: false,
  })
}
