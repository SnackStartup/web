import { createFileRoute, Link } from '@tanstack/react-router'
import { useApiAdminPlaceQuery } from '#/api/admin/use-place-query'
import { useApiAdminGoogleReviewsQuery } from '#/api/admin/use-google-reviews-query'
import { useApiIsAdminQuery } from '#/api/admin/use-is-admin-query'
import { Page } from '#/components/page'
import { PlaceView } from '#/components/place-view'
import { Spinner } from '#/components/ui/spinner'
import { adminPlaceToApiPlace } from '#/lib/admin'
import { getAccessToken } from '#/stores/auth-token'

// The `admin_` prefix keeps this route under /admin without nesting it in the
// admin layout, so the guest page still renders full screen.
export const Route = createFileRoute('/admin_/preview/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const hasToken = Boolean(getAccessToken())
  const apiIsAdminQuery = useApiIsAdminQuery()
  const apiAdminPlaceQuery = useApiAdminPlaceQuery(hasToken ? id : '')
  const apiAdminGoogleReviewsQuery = useApiAdminGoogleReviewsQuery(
    hasToken ? id : '',
  )

  if (!hasToken || apiIsAdminQuery.isError) {
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

  if (apiIsAdminQuery.isPending || apiAdminPlaceQuery.isPending) {
    return (
      <Page className="flex min-h-screen items-center justify-center">
        <Spinner className="size-12" />
      </Page>
    )
  }

  if (!apiAdminPlaceQuery.data) {
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
      place={adminPlaceToApiPlace(apiAdminPlaceQuery.data)}
      placeId={id}
      preview
      googleReviews={apiAdminGoogleReviewsQuery.data}
    />
  )
}
