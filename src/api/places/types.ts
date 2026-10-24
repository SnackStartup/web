import { z } from 'zod'

export const zApiPlaceImage = z.object({
  id: z.string(),
  position: z.number(),
  tile_url: z.string(),
  full_url: z.string(),
})

export type ApiPlaceImage = z.infer<typeof zApiPlaceImage>

export const zApiPlace = z.object({
  id: z.string(),
  suffix: z.string().optional(),
  name: z.string(),
  location: z.string(),
  instagram_url: z.string(),
  facebook_url: z.string(),
  description: z.string(),
  primary_color: z.string(),
  background_opacity: z.string().optional(),
  color_scheme: z.enum(['dark', 'light']).optional(),
  neon: z.boolean().optional(),
  coffee_budget: z.number().optional(),
  logo_url: z.string(),
  background_url: z.string(),
  gallery: z.array(zApiPlaceImage),
})

export type ApiPlace = z.infer<typeof zApiPlace>

export const zApiPlaceSummary = zApiPlace.pick({
  id: true,
  name: true,
  suffix: true,
})

export type ApiPlaceSummary = z.infer<typeof zApiPlaceSummary>
