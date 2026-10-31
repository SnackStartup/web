export const adminKeys = {
  all: ['admin'] as const,
  me: ['admin', 'me'] as const,
  places: ['admin', 'places'] as const,
  place: (id: string) => ['admin', 'place', id] as const,
  placeExport: (id: string) => ['admin', 'place', id, 'export'] as const,
  placeQr: (id: string) => ['admin', 'place', id, 'qr'] as const,
  placeGoogleReviews: (id: string) =>
    ['admin', 'place', id, 'google-reviews'] as const,
  paymentQr: (id: string) => ['admin', 'place', id, 'payment-qr'] as const,
  googlePlacesSearch: (query: string) =>
    ['admin', 'google-places-search', query] as const,
}

export const placeKeys = {
  all: ['places'] as const,
  detail: (id: string) => ['place', id] as const,
  googleReviews: (id: string) => ['place', id, 'google-reviews'] as const,
}
