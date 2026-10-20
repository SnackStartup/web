import type { AdminPlace, PlaceInput } from '#/api/admin/client'

export const toInput = (place: AdminPlace): PlaceInput => ({
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
  is_published: place.is_published,
})

export const EMPTY_PLACE: PlaceInput = {
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
  is_published: false,
}
