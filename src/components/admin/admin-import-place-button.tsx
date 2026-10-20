import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { isAxiosError } from 'axios'
import { Upload } from 'lucide-react'
import { useApiPlaceImportMutation } from '#/api/admin/use-place-import-mutation'
import type { ApiPlaceExport } from '#/api/admin/types'
import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { FileUpload, FileUploadTrigger } from '#/components/ui/file-upload'
import { Input } from '#/components/ui/input'
import { Spinner } from '#/components/ui/spinner'

const INVALID_FILE_MESSAGE =
  'Import failed. The file must come from "Export" in Stolik admin.'

export const AdminImportPlaceButton: React.FC = () => {
  const navigate = useNavigate()
  const apiPlaceImportMutation = useApiPlaceImportMutation()
  const [error, setError] = useState<string | null>(null)
  const [conflict, setConflict] = useState<{
    payload: ApiPlaceExport
    id: string
  } | null>(null)

  const runImport = async (payload: ApiPlaceExport) => {
    setError(null)
    try {
      const created = await apiPlaceImportMutation.mutateAsync(payload)
      await navigate({ to: '/admin/place/$id', params: { id: created.id } })
    } catch (caught) {
      if (isAxiosError(caught) && caught.response?.status === 409) {
        setConflict({ payload, id: `${payload.place.id}-copy` })
        return
      }
      setError(INVALID_FILE_MESSAGE)
    }
  }

  const handleFile = async (file: File) => {
    try {
      await runImport(JSON.parse(await file.text()) as ApiPlaceExport)
    } catch {
      setError(INVALID_FILE_MESSAGE)
    }
  }

  return (
    <>
      <FileUpload
        accept="application/json,.json"
        maxFiles={1}
        onFileAccept={(file) => void handleFile(file)}
      >
        <FileUploadTrigger asChild>
          <Button variant="outline" disabled={apiPlaceImportMutation.isPending}>
            {apiPlaceImportMutation.isPending ? <Spinner /> : <Upload />}
            {apiPlaceImportMutation.isPending ? 'Importing…' : 'Import place'}
          </Button>
        </FileUploadTrigger>
      </FileUpload>

      {error && <span className="text-sm text-destructive">{error}</span>}

      <Dialog
        open={Boolean(conflict)}
        onOpenChange={(open) => {
          if (!open) setConflict(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>That id already exists</DialogTitle>
            <DialogDescription>
              Pick another id for the imported place. Lowercase letters, digits
              and dashes only.
            </DialogDescription>
          </DialogHeader>
          <Input
            autoFocus
            value={conflict?.id ?? ''}
            onChange={(event) =>
              setConflict((previous) =>
                previous ? { ...previous, id: event.target.value } : previous,
              )
            }
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setConflict(null)}>
              Cancel
            </Button>
            <Button
              disabled={apiPlaceImportMutation.isPending}
              onClick={() => {
                if (!conflict) return
                const payload: ApiPlaceExport = {
                  ...conflict.payload,
                  place: {
                    ...conflict.payload.place,
                    id: conflict.id.trim().toLowerCase(),
                  },
                }
                setConflict(null)
                void runImport(payload)
              }}
            >
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
