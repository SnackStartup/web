import { z } from 'zod'

export const zApiAdminImage = z.object({
  id: z.string(),
  position: z.number(),
  tile_url: z.string(),
  full_url: z.string(),
})

export type ApiAdminImage = z.infer<typeof zApiAdminImage>

export const zApiAdminPlace = z.object({
  id: z.string(),
  suffix: z.string().nullable(),
  name: z.string(),
  location: z.string(),
  instagram_url: z.string(),
  facebook_url: z.string(),
  description: z.string(),
  primary_color: z.string(),
  background_opacity: z.string().nullable(),
  color_scheme: z.enum(['dark', 'light']).nullable(),
  neon: z.boolean(),
  coffee_budget: z.number(),
  wifi_ssid: z.string(),
  wifi_password: z.string(),
  google_place_id: z.string().nullable(),
  is_published: z.boolean(),
  updated_at: z.string(),
  payment_token: z.string().nullable(),
  logo_url: z.string(),
  background_url: z.string(),
  gallery: z.array(zApiAdminImage),
})

export type ApiAdminPlace = z.infer<typeof zApiAdminPlace>

// Create sends the id in the body, update takes it from the path, so the form
// state carries the id and the update mutation strips it.
export const zApiAdminPlaceInput = zApiAdminPlace.omit({
  logo_url: true,
  background_url: true,
  gallery: true,
  updated_at: true,
  payment_token: true,
})

export type ApiAdminPlaceInput = z.infer<typeof zApiAdminPlaceInput>

export const zApiAdminMe = z.object({
  email: z.string(),
  environment: z.enum(['local', 'staging', 'prod']),
  assets_public_url: z.string(),
  public_web_url: z.string(),
})

export type ApiAdminMe = z.infer<typeof zApiAdminMe>

export const zApiGooglePlaceSearchResult = z.object({
  place_id: z.string(),
  name: z.string(),
  address: z.string(),
  rating: z.number().nullable(),
  rating_count: z.number().nullable(),
})

export type ApiGooglePlaceSearchResult = z.infer<
  typeof zApiGooglePlaceSearchResult
>

export const zApiPlaceExport = z.object({
  version: z.number(),
  place: zApiAdminPlaceInput,
  logo: z.string().nullable(),
  background: z.string().nullable(),
  gallery: z.array(z.string()),
})

export type ApiPlaceExport = z.infer<typeof zApiPlaceExport>
