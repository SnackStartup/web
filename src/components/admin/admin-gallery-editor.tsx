import { useState } from 'react'
import { ArrowLeft, ArrowRight, Trash2 } from 'lucide-react'
import { useApiDeleteGalleryImageMutation } from '#/api/admin/use-delete-gallery-image-mutation'
import { useApiReorderGalleryMutation } from '#/api/admin/use-reorder-gallery-mutation'
import { useApiUploadGalleryImagesMutation } from '#/api/admin/use-upload-gallery-images-mutation'
import type { ApiAdminImage, ApiAdminPlace } from '#/api/admin/types'
import { AdminConfirmDialog } from '#/components/admin/admin-confirm-dialog'
import { Button } from '#/components/ui/button'
import { FileUpload, FileUploadTrigger } from '#/components/ui/file-upload'
import { Spinner } from '#/components/ui/spinner'

// Mirrors place_assets.MAX_GALLERY on the backend.
const GALLERY_LIMIT = 12

export type AdminGalleryEditorProps = {
  place: ApiAdminPlace
  onPreview: (url: string) => void
}

export const AdminGalleryEditor: React.FC<AdminGalleryEditorProps> = ({
  place,
  onPreview,
}) => {
  const uploadImages = useApiUploadGalleryImagesMutation()
  const deleteImage = useApiDeleteGalleryImageMutation()
  const reorderGallery = useApiReorderGalleryMutation()
  const [imageToDelete, setImageToDelete] = useState<ApiAdminImage | null>(null)

  const isPending =
    uploadImages.isPending || deleteImage.isPending || reorderGallery.isPending
  const isFull = place.gallery.length >= GALLERY_LIMIT

  const move = (from: number, to: number) => {
    const imageIds = place.gallery.map((image) => image.id)
    if (to < 0 || to >= imageIds.length) return
    const [moved] = imageIds.splice(from, 1)
    imageIds.splice(to, 0, moved)
    reorderGallery.mutate({ placeId: place.id, imageIds })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          Gallery ({place.gallery.length}/{GALLERY_LIMIT})
        </span>
        <FileUpload
          accept="image/*"
          multiple
          maxFiles={GALLERY_LIMIT - place.gallery.length}
          onAccept={(files) => {
            uploadImages.mutate({ placeId: place.id, files })
          }}
        >
          <FileUploadTrigger asChild>
            <Button variant="outline" size="sm" disabled={isPending || isFull}>
              {uploadImages.isPending && <Spinner />}
              Add photos
            </Button>
          </FileUploadTrigger>
        </FileUpload>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {place.gallery.map((image, index) => (
          <div key={image.id} className="flex flex-col gap-1">
            <button
              type="button"
              title="Click to enlarge"
              onClick={() => onPreview(image.full_url || image.tile_url)}
              className="cursor-pointer overflow-hidden rounded-md"
            >
              <img
                src={image.tile_url}
                alt=""
                className="aspect-square w-full rounded-md object-cover"
              />
            </button>
            <div className="flex items-stretch gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                className="flex-1"
                aria-label="Move earlier"
                disabled={isPending || index === 0}
                onClick={() => move(index, index - 1)}
              >
                <ArrowLeft />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                className="flex-1 text-destructive"
                aria-label="Delete photo"
                disabled={isPending}
                onClick={() => setImageToDelete(image)}
              >
                <Trash2 />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                className="flex-1"
                aria-label="Move later"
                disabled={isPending || index === place.gallery.length - 1}
                onClick={() => move(index, index + 1)}
              >
                <ArrowRight />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <AdminConfirmDialog
        open={Boolean(imageToDelete)}
        title="Delete this photo?"
        description="It disappears from the guest page right away."
        confirmLabel="Delete photo"
        isPending={deleteImage.isPending}
        onConfirm={() => {
          if (!imageToDelete) return
          deleteImage.mutate(
            { placeId: place.id, imageId: imageToDelete.id },
            { onSuccess: () => setImageToDelete(null) },
          )
        }}
        onOpenChange={(open) => {
          if (!open) setImageToDelete(null)
        }}
      />
    </div>
  )
}
