export type ApiPlace = {
  id: string
  suffix?: string
  name: string
  location: string
  instagram_url: string
  facebook_url: string
  description: string
  gallery_count: number
  primary_color: string
  background_opacity?: string
  color_scheme?: 'dark' | 'light'
  neon?: boolean
}

export type ApiPlaceSummary = Pick<ApiPlace, 'id' | 'name' | 'suffix'>
