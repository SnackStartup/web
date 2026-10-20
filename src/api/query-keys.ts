export const adminKeys = {
  all: ['admin'] as const,
  me: ['admin', 'me'] as const,
  places: ['admin', 'places'] as const,
  place: (id: string) => ['admin', 'place', id] as const,
  placeExport: (id: string) => ['admin', 'place', id, 'export'] as const,
  placeQr: (id: string, format: string) =>
    ['admin', 'place', id, 'qr', format] as const,
}

export const placeKeys = {
  all: ['places'] as const,
  detail: (id: string) => ['place', id] as const,
}
