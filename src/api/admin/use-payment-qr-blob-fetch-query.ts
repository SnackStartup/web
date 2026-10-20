import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../client'
import { adminKeys } from '../query-keys'
import type { ApiQrFormat } from './types'

// The payment QR encodes the place's payment link, so rotating or revoking the
// token changes the code: the payments panel invalidates this cache for us.
export const useApiAdminPaymentQrBlobFetchQuery = (
  placeId: string,
  format: ApiQrFormat = 'png',
) =>
  useQuery({
    queryKey: adminKeys.paymentQr(placeId, format),
    queryFn: async () =>
      (
        await apiClient.get<Blob>(
          `/admin/places/${placeId}/payment-qr.${format}`,
          { responseType: 'blob' },
        )
      ).data,
    enabled: Boolean(placeId),
    staleTime: 60 * 60 * 1000,
  })
