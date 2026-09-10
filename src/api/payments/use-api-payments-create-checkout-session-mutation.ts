import { useMutation } from '@tanstack/react-query'
import { apiClient } from '../client'
import type { ApiCheckoutPlan } from './types'

export type ApiPaymentsCreateCheckoutSessionResponse = {
  client_secret: string
  plan: ApiCheckoutPlan
  place_id: string
}

export const useApiPaymentsCreateCheckoutSessionMutation = () => {
  return useMutation({
    mutationFn: async (token: string) => {
      const form = new FormData()
      form.append('token', token)
      return (
        await apiClient.post<ApiPaymentsCreateCheckoutSessionResponse>(
          '/payments/checkout-session',
          form,
        )
      ).data
    },
  })
}
