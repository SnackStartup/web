export type ApiCheckoutPlan = {
  name: string
  amount: number
  currency: string
  interval: string
}

export type ApiCheckoutSessionDetails = {
  status: string
  payment_status: string
  amount_total: number
  currency: string
  customer_email: string | null
  place_id: string | null
}
