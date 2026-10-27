import { useApiLogoutMutation } from '#/api/auth/use-logout-mutation'
import { Button } from '#/components/ui/button'
import { useUnsavedChangesStore } from '#/stores/unsaved-changes-store'

export const AdminSignOutButton: React.FC = () => {
  const apiLogoutMutation = useApiLogoutMutation()
  const requestLeave = useUnsavedChangesStore((state) => state.requestLeave)
  const isDirty = useUnsavedChangesStore(
    (state) => state.draft?.isDirty === true,
  )

  // Sign out is not a navigation, so the router blocker never sees it. With
  // unsaved changes it goes through the same dialog instead.
  const signOut = () => {
    if (!isDirty) {
      apiLogoutMutation.mutate()
      return
    }
    requestLeave({
      intent: 'signOut',
      proceed: () => apiLogoutMutation.mutate(),
      reset: () => undefined,
    })
  }

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={apiLogoutMutation.isPending}
      onClick={signOut}
    >
      {apiLogoutMutation.isPending ? 'Signing out…' : 'Sign out'}
    </Button>
  )
}
