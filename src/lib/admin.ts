import type { ApiAdminPlace, ApiAdminPlaceInput } from '#/api/admin/types'
import type { ApiPlace } from '#/api/places/types'

// The create endpoint takes the id in the body, the update endpoint takes it
// from the path, so the editor keeps the id in form state and the mutation
// strips it before a PUT.
export const adminPlaceToPlaceInput = (
  place: ApiAdminPlace,
): ApiAdminPlaceInput => ({
  id: place.id,
  suffix: place.suffix,
  name: place.name,
  location: place.location,
  instagram_url: place.instagram_url,
  facebook_url: place.facebook_url,
  description: place.description,
  primary_color: place.primary_color,
  background_opacity: place.background_opacity,
  color_scheme: place.color_scheme,
  neon: place.neon,
  coffee_budget: place.coffee_budget,
  wifi_ssid: place.wifi_ssid,
  wifi_password: place.wifi_password,
  google_place_id: place.google_place_id,
  is_published: place.is_published,
})

export const emptyAdminPlaceInput: ApiAdminPlaceInput = {
  id: '',
  suffix: null,
  name: '',
  location: '',
  instagram_url: '',
  facebook_url: '',
  description: '',
  primary_color: '#d33886',
  background_opacity: null,
  color_scheme: null,
  neon: false,
  coffee_budget: 0,
  wifi_ssid: '',
  wifi_password: '',
  google_place_id: null,
  is_published: false,
}

// Narrow the admin payload to the shape the guest page renders.
export const adminPlaceToApiPlace = (place: ApiAdminPlace): ApiPlace => ({
  id: place.id,
  suffix: place.suffix ?? undefined,
  name: place.name,
  location: place.location,
  instagram_url: place.instagram_url,
  facebook_url: place.facebook_url,
  description: place.description,
  primary_color: place.primary_color,
  background_opacity: place.background_opacity ?? undefined,
  color_scheme: place.color_scheme ?? undefined,
  neon: place.neon,
  coffee_budget: place.coffee_budget,
  wifi_ssid: place.wifi_ssid,
  wifi_password: place.wifi_password,
  google_place_id: place.google_place_id,
  logo_url: place.logo_url,
  background_url: place.background_url,
  gallery: place.gallery,
})
