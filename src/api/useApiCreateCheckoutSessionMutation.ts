import { useMutation } from '@tanstack/react-query'
import { apiClient } from './client'

export type CheckoutPlan = {
  name: string
  amount: number
  currency: string
  interval: string
}

export type CreateCheckoutSessionResponse = {
  client_secret: string
  plan: CheckoutPlan
}

export const useApiCreateCheckoutSessionMutation = () => {
  return useMutation({
    mutationFn: async (placeId: string) => {
      const form = new FormData()
      form.append('place_id', placeId)
      return (
        await apiClient.post<CreateCheckoutSessionResponse>(
          '/create_checkout_session',
          form,
        )
      ).data
    },
  })
}
