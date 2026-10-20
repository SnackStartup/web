import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Eye, Globe } from 'lucide-react'
import { useApiAdminPlaceExportFetchQuery } from '#/api/admin/use-place-export-fetch-query'
import { useApiPlaceDeleteMutation } from '#/api/admin/use-place-delete-mutation'
import { useApiPlaceSaveMutation } from '#/api/admin/use-place-save-mutation'
import { useApiBrandImageUploadMutation } from '#/api/admin/use-brand-image-upload-mutation'
import type { ApiAdminPlace, ApiAdminPlaceInput } from '#/api/admin/types'
import { AdminConfirmDialog } from '#/components/admin/admin-confirm-dialog'
import { AdminGalleryEditor } from '#/components/admin/admin-gallery-editor'
import { AdminImageSlot } from '#/components/admin/admin-image-slot'
import { AdminPaymentPanel } from '#/components/admin/admin-payment-panel'
import { AdminPlaceForm } from '#/components/admin/admin-place-form'
import { AdminQrPanel } from '#/components/admin/admin-qr-panel'
import { ImageLightbox } from '#/components/image-lightbox'
import { Button } from '#/components/ui/button'
import { Separator } from '#/components/ui/separator'
import { adminPlaceToPlaceInput, emptyAdminPlaceInput } from '#/lib/admin'
import { downloadJsonFile } from '#/lib/download'

export type AdminPlaceEditorProps = {
  isNew: boolean
  place?: ApiAdminPlace
}

export const AdminPlaceEditor: React.FC<AdminPlaceEditorProps> = ({
  isNew,
  place,
}) => {
  const navigate = useNavigate()
  const apiPlaceSaveMutation = useApiPlaceSaveMutation()
  const apiPlaceDeleteMutation = useApiPlaceDeleteMutation()
  const apiBrandImageUploadMutation = useApiBrandImageUploadMutation()
  const apiAdminPlaceExportFetchQuery = useApiAdminPlaceExportFetchQuery(
    place?.id ?? '',
  )
  const [form, setForm] = useState<ApiAdminPlaceInput>(() =>
    place ? adminPlaceToPlaceInput(place) : { ...emptyAdminPlaceInput },
  )
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDeleteOpen, setDeleteOpen] = useState(false)

  const setField = <TKey extends keyof ApiAdminPlaceInput>(
    key: TKey,
    value: ApiAdminPlaceInput[TKey],
  ) => setForm((previous) => ({ ...previous, [key]: value }))

  const save = () => {
    apiPlaceSaveMutation.mutate(
      { place: { ...form, id: form.id.trim().toLowerCase() }, isNew },
      {
        onSuccess: async (saved) => {
          if (isNew) {
            await navigate({
              to: '/admin/place/$id',
              params: { id: saved.id },
              replace: true,
            })
            return
          }
          setForm(adminPlaceToPlaceInput(saved))
        },
      },
    )
  }

  // Export is an on-demand read, so the query stays disabled until the button
  // asks for it and refetch() drives the pending state.
  const exportPlace = async () => {
    if (!place) return
    const result = await apiAdminPlaceExportFetchQuery.refetch()
    if (result.data) downloadJsonFile(`${place.id}.stolik.json`, result.data)
  }

  const saveStatus = apiPlaceSaveMutation.isPending
    ? 'Saving…'
    : apiPlaceSaveMutation.isError
      ? 'Could not save.'
      : apiPlaceSaveMutation.isSuccess
        ? 'Saved'
        : null

  return (
    <section className="flex flex-col gap-6">
      {place && (
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            nativeButton={false}
            render={<Link to="/admin/preview/$id" params={{ id: place.id }} />}
          >
            <Eye />
            Preview draft
          </Button>
          <Button
            variant="outline"
            disabled={!place.is_published}
            className="aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
            title={
              place.is_published
                ? undefined
                : 'Publish the place to open its public page'
            }
            nativeButton={false}
            render={<Link to="/scanned/$id" params={{ id: place.id }} />}
          >
            <Globe />
            Preview published page
          </Button>
        </div>
      )}

      <AdminPlaceForm value={form} isNew={isNew} onChange={setField} />

      <div className="flex flex-wrap items-center gap-3">
        <Button disabled={apiPlaceSaveMutation.isPending} onClick={save}>
          {apiPlaceSaveMutation.isPending ? 'Saving…' : 'Save'}
        </Button>
        {!isNew && place && (
          <Button
            variant="outline"
            disabled={apiAdminPlaceExportFetchQuery.isFetching}
            onClick={() => void exportPlace()}
          >
            {apiAdminPlaceExportFetchQuery.isFetching ? 'Exporting…' : 'Export'}
          </Button>
        )}
        {saveStatus && (
          <span className="text-sm text-muted-foreground">{saveStatus}</span>
        )}
        {!isNew && place && (
          <Button
            variant="destructive"
            className="ml-auto"
            disabled={apiPlaceDeleteMutation.isPending}
            onClick={() => setDeleteOpen(true)}
          >
            Delete place
          </Button>
        )}
      </div>

      {apiAdminPlaceExportFetchQuery.isError && (
        <p className="text-sm text-destructive">Export failed.</p>
      )}

      {!isNew && place && (
        <>
          <Separator />
          <h2 className="font-semibold">Images</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <AdminImageSlot
              label="Logo"
              imageUrl={place.logo_url}
              isUploading={apiBrandImageUploadMutation.isPending}
              onPreview={setPreviewUrl}
              onUpload={(file) =>
                apiBrandImageUploadMutation.mutate({
                  placeId: place.id,
                  kind: 'logo',
                  file,
                })
              }
            />
            <AdminImageSlot
              label="Background"
              imageUrl={place.background_url}
              isUploading={apiBrandImageUploadMutation.isPending}
              onPreview={setPreviewUrl}
              onUpload={(file) =>
                apiBrandImageUploadMutation.mutate({
                  placeId: place.id,
                  kind: 'background',
                  file,
                })
              }
            />
          </div>

          <AdminGalleryEditor place={place} onPreview={setPreviewUrl} />
          <AdminQrPanel placeId={place.id} onPreview={setPreviewUrl} />
          <AdminPaymentPanel place={place} />
        </>
      )}

      <AdminConfirmDialog
        open={isDeleteOpen}
        title="Delete this place?"
        description="The place and all of its photos are gone. This cannot be undone."
        confirmLabel="Delete place"
        isPending={apiPlaceDeleteMutation.isPending}
        onConfirm={() => {
          if (!place) return
          apiPlaceDeleteMutation.mutate(place.id, {
            onSuccess: () => void navigate({ to: '/admin' }),
          })
        }}
        onOpenChange={setDeleteOpen}
      />

      <ImageLightbox
        images={previewUrl ? [previewUrl] : []}
        index={previewUrl ? 0 : null}
        onIndexChange={(index) => {
          if (index === null) setPreviewUrl(null)
        }}
      />
    </section>
  )
}
