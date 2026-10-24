import z from 'zod'

export const zApiWalletPassSchema = z.object({
  save_url: z.string().nullable(),
  object_id: z.string().nullable(),
  points_balance: z.int(),
  reward_points: z.int(),
  redeem_cost: z.int(),
})
export type ApiWalletPass = z.infer<typeof zApiWalletPassSchema>

// gonna add later

// export const zApiWalletRedeemSchema = z.object({
//   redemption_id: z.string(),
//   points: z.int(),
//   points_balance: z.int(),
//   redeemed_at: z.coerce.date(),
// })
// export type ApiWalletRedeem = z.infer<typeof zApiWalletRedeemSchema>
