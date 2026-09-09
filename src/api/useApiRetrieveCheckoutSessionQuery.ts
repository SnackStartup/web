import { useQuery } from '@tanstack/react-query'
import { apiClient } from './client'

export type CheckoutSessionDetails = {
  status: string
  payment_status: string
  amount_total: number
  currency: string
  customer_email: string | null
  place_id: string | null
}

export const useApiRetrieveCheckoutSessionQuery = (sessionId: string) => {
  return useQuery({
    queryKey: ['checkout-session', sessionId],
    queryFn: async () => {
      return (
        await apiClient.get<CheckoutSessionDetails>(
          `/checkout_session/${sessionId}`,
        )
      ).data
    },
    enabled: Boolean(sessionId),
    retry: false,
  })
}
