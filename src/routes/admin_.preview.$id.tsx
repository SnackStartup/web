import { createFileRoute, Link } from '@tanstack/react-router'
import { useApiAdminPlaceQuery } from '#/api/admin/use-place-query'
import { useApiIsAdminQuery } from '#/api/admin/use-is-admin-query'
import { Page } from '#/components/page'
import { PlaceView } from '#/components/place-view'
import { Spinner } from '#/components/ui/spinner'
import { adminPlaceToApiPlace } from '#/lib/admin'
import { getAccessToken } from '#/lib/auth-token'

// The `admin_` prefix keeps this route under /admin without nesting it in the
// admin layout, so the guest page still renders full screen.
export const Route = createFileRoute('/admin_/preview/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const hasToken = Boolean(getAccessToken())
  const isAdminQuery = useApiIsAdminQuery()
  const adminPlaceQuery = useApiAdminPlaceQuery(hasToken ? id : '')

  if (!hasToken || isAdminQuery.isError) {
    return (
      <Page className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-sm text-muted-foreground">
          Draft preview is admin-only.
        </p>
        <Link to="/admin" className="underline hover:text-primary">
          Sign in
        </Link>
      </Page>
    )
  }

  if (isAdminQuery.isPending || adminPlaceQuery.isPending) {
    return (
      <Page className="flex min-h-screen items-center justify-center">
        <Spinner className="size-12" />
      </Page>
    )
  }

  if (!adminPlaceQuery.data) {
    return (
      <Page className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-sm text-muted-foreground">Place not found.</p>
        <Link to="/admin" className="underline hover:text-primary">
          Back to places
        </Link>
      </Page>
    )
  }

  return (
    <PlaceView
      place={adminPlaceToApiPlace(adminPlaceQuery.data)}
      placeId={id}
      preview
    />
  )
}
