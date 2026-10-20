export type ApiPlaceImage = {
  id: string
  position: number
  tile_url: string
  full_url: string
}

export type ApiPlace = {
  id: string
  suffix?: string
  name: string
  location: string
  instagram_url: string
  facebook_url: string
  description: string
  primary_color: string
  background_opacity?: string
  color_scheme?: 'dark' | 'light'
  neon?: boolean
  coffee_budget?: number
  logo_url: string
  background_url: string
  gallery: ApiPlaceImage[]
}

export type ApiPlaceSummary = Pick<ApiPlace, 'id' | 'name' | 'suffix'>
