import { useEffect, useState } from 'react'
import { useApiAdminPaymentQrBlobFetchQuery } from '#/api/admin/use-payment-qr-blob-fetch-query'
import { Button } from '#/components/ui/button'
import { Spinner } from '#/components/ui/spinner'

export type AdminPaymentQrPanelProps = {
  placeId: string
  onPreview: (url: string) => void
}

export const AdminPaymentQrPanel: React.FC<AdminPaymentQrPanelProps> = ({
  placeId,
  onPreview,
}) => {
  const apiAdminPaymentQrBlobFetchQuery =
    useApiAdminPaymentQrBlobFetchQuery(placeId)
  const [qrUrl, setQrUrl] = useState<string | null>(null)

  // The blob comes from the query cache; the object URL is the component's to
  // own, so it is created and revoked here.
  useEffect(() => {
    if (!apiAdminPaymentQrBlobFetchQuery.data) {
      setQrUrl(null)
      return
    }
    const objectUrl = URL.createObjectURL(apiAdminPaymentQrBlobFetchQuery.data)
    setQrUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [apiAdminPaymentQrBlobFetchQuery.data])

  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-semibold">Payment QR</h3>
      <p className="text-sm text-muted-foreground">
        Green, so nobody mixes it up with the guest QR. The code opens the
        payment link above.
      </p>
      {apiAdminPaymentQrBlobFetchQuery.isError && (
        <p className="text-sm text-destructive">
          Could not load the payment QR code.
        </p>
      )}
      {qrUrl ? (
        <>
          <Button
            variant="ghost"
            title="Click to enlarge"
            className="size-48 overflow-hidden rounded-md border p-0"
            onClick={() => onPreview(qrUrl)}
          >
            <img src={qrUrl} alt="Payment QR code" className="size-full" />
          </Button>
          <Button
            variant="outline"
            className="w-fit"
            nativeButton={false}
            render={<a href={qrUrl} download={`${placeId}-payment-qr.png`} />}
          >
            Download PNG
          </Button>
        </>
      ) : (
        apiAdminPaymentQrBlobFetchQuery.isPending && <Spinner />
      )}
    </div>
  )
}
