import { useCallback, useState } from 'react'
import { useBlocker } from '@tanstack/react-router'
import { AdminUnsavedChangesDialog } from '#/components/admin/admin-unsaved-changes-dialog'
import {
  hasUnsavedChanges,
  useUnsavedChangesStore,
} from '#/stores/unsaved-changes-store'

// Mounted once by the admin layout, so the panel has one blocker and one
// dialog. The editor registers the draft; this reads it and runs the dialog.
export const AdminUnsavedChangesGuard: React.FC = () => {
  const draft = useUnsavedChangesStore((state) => state.draft)
  const request = useUnsavedChangesStore((state) => state.request)
  const clearRequest = useUnsavedChangesStore((state) => state.clearRequest)
  const [isSaving, setIsSaving] = useState(false)

  const shouldBlockFn = useCallback(() => hasUnsavedChanges(), [])

  const blocker = useBlocker({
    shouldBlockFn,
    withResolver: true,
    disabled: !draft?.isDirty,
    enableBeforeUnload: true,
  })

  // A blocked navigation arrives from the router with a resolver. Sign out has
  // none, so it comes through the store instead.
  const pending =
    blocker.status === 'blocked'
      ? {
          intent: 'navigate' as const,
          proceed: blocker.proceed,
          reset: blocker.reset,
        }
      : request

  const keepEditing = () => {
    if (isSaving) return
    pending?.reset()
    clearRequest()
  }

  const discard = () => {
    if (isSaving) return
    pending?.proceed()
    clearRequest()
  }

  const saveAndLeave = async () => {
    if (!draft || isSaving) return
    setIsSaving(true)
    try {
      await draft.save()
      pending?.proceed()
      clearRequest()
    } catch {
      // Stay put. The editor's own status line explains the failure.
      pending?.reset()
      clearRequest()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AdminUnsavedChangesDialog
      open={pending !== null}
      intent={pending?.intent ?? 'navigate'}
      isSaving={isSaving}
      onKeepEditing={keepEditing}
      onDiscard={discard}
      onSaveAndLeave={() => void saveAndLeave()}
    />
  )
}
