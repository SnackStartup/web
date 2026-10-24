import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../client'
import { adminKeys } from '../query-keys'

// The payment QR encodes the place's payment link, so rotating or revoking the
// token changes the code: the payments panel invalidates this cache for us.
export const useApiAdminPaymentQrBlobFetchQuery = (placeId: string) =>
  useQuery({
    queryKey: adminKeys.paymentQr(placeId),
    queryFn: async () =>
      (
        await apiClient.get<Blob>(`/admin/places/${placeId}/payment-qr.png`, {
          responseType: 'blob',
        })
      ).data,
    enabled: Boolean(placeId),
    staleTime: 60 * 60 * 1000,
  })
