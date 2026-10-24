import { useEffect, useState } from 'react'
import { useApiAdminQrBlobFetchQuery } from '#/api/admin/use-qr-blob-fetch-query'
import { Button } from '#/components/ui/button'
import { Spinner } from '#/components/ui/spinner'

export type AdminQrPanelProps = {
  placeId: string
  onPreview: (url: string) => void
}

export const AdminQrPanel: React.FC<AdminQrPanelProps> = ({
  placeId,
  onPreview,
}) => {
  const apiAdminQrBlobFetchQuery = useApiAdminQrBlobFetchQuery(placeId)
  const [qrUrl, setQrUrl] = useState<string | null>(null)

  // The blob comes from the query cache; the object URL is the component's to
  // own, so it is created and revoked here.
  useEffect(() => {
    if (!apiAdminQrBlobFetchQuery.data) {
      setQrUrl(null)
      return
    }
    const objectUrl = URL.createObjectURL(apiAdminQrBlobFetchQuery.data)
    setQrUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [apiAdminQrBlobFetchQuery.data])

  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-semibold">QR code</h2>
      {apiAdminQrBlobFetchQuery.isError && (
        <p className="text-sm text-destructive">Could not load the QR code.</p>
      )}
      {qrUrl ? (
        <>
          <Button
            variant="ghost"
            title="Click to enlarge"
            className="size-48 rounded-md border bg-white p-2"
            onClick={() => onPreview(qrUrl)}
          >
            <img src={qrUrl} alt="QR code" className="size-full" />
          </Button>
          <Button
            variant="outline"
            className="w-fit"
            nativeButton={false}
            render={<a href={qrUrl} download={`${placeId}-qr.png`} />}
          >
            Download PNG
          </Button>
        </>
      ) : (
        apiAdminQrBlobFetchQuery.isPending && <Spinner />
      )}
    </div>
  )
}
