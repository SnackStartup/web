import { Button } from '#/components/ui/button'
import { FileUpload, FileUploadTrigger } from '#/components/ui/file-upload'
import { Spinner } from '#/components/ui/spinner'

export type AdminImageSlotProps = {
  label: string
  imageUrl: string
  isUploading: boolean
  onUpload: (file: File) => void
  onPreview: (url: string) => void
}

export const AdminImageSlot: React.FC<AdminImageSlotProps> = ({
  label,
  imageUrl,
  isUploading,
  onUpload,
  onPreview,
}) => (
  <div className="flex flex-col gap-2">
    <span className="text-sm font-medium">{label}</span>
    <div className="flex items-center gap-4">
      {imageUrl ? (
        <Button
          variant="ghost"
          title="Click to enlarge"
          className="size-24 overflow-hidden rounded-md border p-0"
          onClick={() => onPreview(imageUrl)}
        >
          <img src={imageUrl} alt="" className="size-full object-cover" />
        </Button>
      ) : (
        <div className="grid size-24 place-items-center rounded-md border bg-muted">
          <span className="text-xs text-muted-foreground">none</span>
        </div>
      )}
      <FileUpload accept="image/*" maxFiles={1} onFileAccept={onUpload}>
        <FileUploadTrigger asChild>
          <Button variant="outline" size="sm" disabled={isUploading}>
            {isUploading && <Spinner />}
            {isUploading ? 'Uploading…' : 'Change'}
          </Button>
        </FileUploadTrigger>
      </FileUpload>
    </div>
  </div>
)
