import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../client'
import { adminKeys } from '../query-keys'
import type { ApiQrFormat } from './types'

// The QR encodes the place slug and the public web URL, so it stays fresh for
// as long as the place itself does.
export const useApiAdminQrBlobFetchQuery = (
  placeId: string,
  format: ApiQrFormat = 'png',
) =>
  useQuery({
    queryKey: adminKeys.placeQr(placeId, format),
    queryFn: async () =>
      (
        await apiClient.get<Blob>(`/admin/places/${placeId}/qr.${format}`, {
          responseType: 'blob',
        })
      ).data,
    enabled: Boolean(placeId),
    staleTime: 60 * 60 * 1000,
  })
