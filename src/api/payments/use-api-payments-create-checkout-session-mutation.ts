import { useMutation } from '@tanstack/react-query'
import { apiClient } from '../client'
import type { ApiCheckoutPlan, PaymentMode } from './types'

export type ApiPaymentsCreateCheckoutSessionResponse = {
  client_secret: string
  plan: ApiCheckoutPlan
  mode: PaymentMode
  place_id: string
}

export const useApiPaymentsCreateCheckoutSessionMutation = () => {
  return useMutation({
    mutationFn: async ({
      token,
      mode = 'subscription',
    }: {
      token: string
      mode?: PaymentMode
    }) => {
      const form = new FormData()
      form.append('token', token)
      form.append('mode', mode)
      return (
        await apiClient.post<ApiPaymentsCreateCheckoutSessionResponse>(
          '/payments/checkout-session',
          form,
        )
      ).data
    },
  })
}
