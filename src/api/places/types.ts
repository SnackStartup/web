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
  wifi_ssid: z.string().optional(),
  wifi_password: z.string().optional(),
  // Google venue id; absent, null or empty means no reviews block.
  google_place_id: z.string().nullable().optional(),
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

export const zApiGoogleReview = z.object({
  id: z.string(),
  author_name: z.string(),
  author_uri: z.string().nullable(),
  author_photo_uri: z.string().nullable(),
  rating: z.number(),
  relative_time: z.string(),
  text: z.string(),
  original_text: z.string().nullable(),
  google_maps_uri: z.string().nullable(),
  flag_content_uri: z.string().nullable(),
})

export type ApiGoogleReview = z.infer<typeof zApiGoogleReview>

export const zApiGoogleReviews = z.object({
  // available separates "no reviews yet" (the page shows a prompt) from "nothing
  // to show" (no key, unlinked venue, Google unreachable), which hides the block.
  available: z.boolean(),
  // Which listing this is, for the editor; the storefront ignores both.
  venue_name: z.string(),
  venue_address: z.string(),
  rating: z.number().nullable(),
  rating_count: z.number().nullable(),
  maps_uri: z.string().nullable(),
  reviews: z.array(zApiGoogleReview),
})

export type ApiGoogleReviews = z.infer<typeof zApiGoogleReviews>
