import { useRef, useState } from 'react'
import { useApiPaymentTokenRevokeMutation } from '#/api/admin/use-payment-token-revoke-mutation'
import { useApiPaymentTokenRotateMutation } from '#/api/admin/use-payment-token-rotate-mutation'
import type { ApiAdminPlace } from '#/api/admin/types'
import { AdminConfirmDialog } from '#/components/admin/admin-confirm-dialog'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { getPublicWebUrl } from '#/lib/env'

export type AdminPaymentPanelProps = {
  place: ApiAdminPlace
}

export const AdminPaymentPanel: React.FC<AdminPaymentPanelProps> = ({
  place,
}) => {
  const apiPaymentTokenRotateMutation = useApiPaymentTokenRotateMutation()
  const apiPaymentTokenRevokeMutation = useApiPaymentTokenRevokeMutation()
  const linkInputRef = useRef<HTMLInputElement>(null)
  const [copied, setCopied] = useState(false)
  const [isRotateOpen, setRotateOpen] = useState(false)
  const [isRevokeOpen, setRevokeOpen] = useState(false)

  const link = place.payment_token
    ? `${getPublicWebUrl()}/pay/${place.payment_token}`
    : null
  const isPending =
    apiPaymentTokenRotateMutation.isPending ||
    apiPaymentTokenRevokeMutation.isPending

  const copy = async () => {
    if (!link) return
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      linkInputRef.current?.select()
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-semibold">Payments</h2>
      <p className="text-sm text-muted-foreground">
        The payment link belongs to this place. Generating a new one invalidates
        the old link.
      </p>

      {link ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              ref={linkInputRef}
              readOnly
              value={link}
              className="min-w-0 flex-1 text-xs"
            />
            <Button variant="outline" onClick={() => void copy()}>
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              disabled={isPending}
              onClick={() => setRotateOpen(true)}
            >
              Rotate link
            </Button>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={() => setRevokeOpen(true)}
            >
              Revoke
            </Button>
          </div>
        </>
      ) : (
        <Button
          className="w-fit"
          disabled={isPending}
          onClick={() => apiPaymentTokenRotateMutation.mutate(place.id)}
        >
          {apiPaymentTokenRotateMutation.isPending
            ? 'Generating…'
            : 'Generate payment link'}
        </Button>
      )}

      <AdminConfirmDialog
        open={isRotateOpen}
        title="Generate a new payment link?"
        description="The old link stops working immediately."
        confirmLabel="Rotate link"
        isPending={apiPaymentTokenRotateMutation.isPending}
        onConfirm={() =>
          apiPaymentTokenRotateMutation.mutate(place.id, {
            onSuccess: () => setRotateOpen(false),
          })
        }
        onOpenChange={setRotateOpen}
      />
      <AdminConfirmDialog
        open={isRevokeOpen}
        title="Revoke the payment link?"
        description="Guests can no longer pay for this place until you generate a new link."
        confirmLabel="Revoke link"
        isPending={apiPaymentTokenRevokeMutation.isPending}
        onConfirm={() =>
          apiPaymentTokenRevokeMutation.mutate(place.id, {
            onSuccess: () => setRevokeOpen(false),
          })
        }
        onOpenChange={setRevokeOpen}
      />
    </div>
  )
}
