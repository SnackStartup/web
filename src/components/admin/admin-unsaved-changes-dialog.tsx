import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import type { LeaveIntent } from '#/stores/unsaved-changes-store'

const DISPOSITIONS: Record<
  LeaveIntent,
  { description: string; discard: string; saveAndLeave: string }
> = {
  navigate: {
    description: 'Leaving now discards them.',
    discard: 'Discard changes',
    saveAndLeave: 'Save and leave',
  },
  signOut: {
    description: 'Signing out now discards them.',
    discard: 'Discard changes and sign out',
    saveAndLeave: 'Save and sign out',
  },
}

export type AdminUnsavedChangesDialogProps = {
  open: boolean
  intent: LeaveIntent
  isSaving: boolean
  onKeepEditing: () => void
  onDiscard: () => void
  onSaveAndLeave: () => void
}

export const AdminUnsavedChangesDialog: React.FC<
  AdminUnsavedChangesDialogProps
> = ({ open, intent, isSaving, onKeepEditing, onDiscard, onSaveAndLeave }) => {
  const disposition = DISPOSITIONS[intent]

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // Escape and the backdrop mean keep editing, but never while a save
        // the user asked for is still running.
        if (!next && !isSaving) onKeepEditing()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>You have unsaved changes</DialogTitle>
          <DialogDescription>{disposition.description}</DialogDescription>
        </DialogHeader>
        {/* The sign-out labels are long, so on a narrow screen the row and the
            button group wrap rather than overflow the dialog. */}
        <DialogFooter className="sm:flex-wrap sm:justify-between">
          <Button variant="outline" disabled={isSaving} onClick={onKeepEditing}>
            Keep editing
          </Button>
          <div className="flex flex-col-reverse gap-2 sm:ml-auto sm:flex-row sm:flex-wrap sm:justify-end">
            <Button
              variant="destructive"
              disabled={isSaving}
              onClick={onDiscard}
            >
              {disposition.discard}
            </Button>
            <Button disabled={isSaving} onClick={onSaveAndLeave}>
              {isSaving ? 'Saving…' : disposition.saveAndLeave}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
