import { z } from 'zod'

export const zPaymentMode = z.enum(['subscription', 'payment'])

export type PaymentMode = z.infer<typeof zPaymentMode>

export const zApiCheckoutPlan = z.object({
  name: z.string(),
  amount: z.number(),
  currency: z.string(),
  interval: z.string().nullable(),
  type: z.enum(['subscription', 'one_time']),
})

export type ApiCheckoutPlan = z.infer<typeof zApiCheckoutPlan>

export const zApiCheckoutSessionDetails = z.object({
  status: z.string(),
  payment_status: z.string(),
  amount_total: z.number(),
  currency: z.string(),
  customer_email: z.string().nullable(),
  place_id: z.string().nullable(),
})

export type ApiCheckoutSessionDetails = z.infer<
  typeof zApiCheckoutSessionDetails
>
