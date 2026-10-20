import { createFileRoute, Link } from '@tanstack/react-router'
import type { AdminPlace } from '#/api/admin/client'
import { useAdminPlaceQuery } from '#/api/admin/client'
import { useIsAdminQuery } from '#/api/admin/use-is-admin-query'
import type { ApiPlace } from '#/api/places/types'
import { PlaceView } from '#/components/place-view'
import { Page } from '#/components/page'
import { Spinner } from '#/components/ui/spinner'
import { getAccessToken } from '#/lib/auth-token'

// The `admin_` prefix keeps this route under /admin without nesting it in the
// admin layout, so the guest page still renders full screen.
export const Route = createFileRoute('/admin_/preview/$id')({
  component: RouteComponent,
})

// Narrow the admin payload to the shape the guest page renders.
const toApiPlace = (place: AdminPlace): ApiPlace => ({
  id: place.id,
  suffix: place.suffix ?? undefined,
  name: place.name,
  location: place.location,
  instagram_url: place.instagram_url,
  facebook_url: place.facebook_url,
  description: place.description,
  primary_color: place.primary_color,
  background_opacity: place.background_opacity ?? undefined,
  color_scheme: place.color_scheme ?? undefined,
  neon: place.neon,
  coffee_budget: place.coffee_budget,
  logo_url: place.logo_url,
  background_url: place.background_url,
  gallery: place.gallery,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const hasToken = Boolean(getAccessToken())
  const adminQuery = useIsAdminQuery()
  const placeQuery = useAdminPlaceQuery(hasToken ? id : '')

  if (!hasToken || adminQuery.isError) {
    return (
      <Page className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-sm text-neutral-400">Draft preview is admin-only.</p>
        <Link to="/admin" className="underline hover:text-primary">
          Sign in
        </Link>
      </Page>
    )
  }

  if (adminQuery.isPending || placeQuery.isPending) {
    return (
      <Page className="flex min-h-screen items-center justify-center">
        <Spinner className="size-12" />
      </Page>
    )
  }

  if (!placeQuery.data) {
    return (
      <Page className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-sm text-neutral-400">Place not found.</p>
        <Link to="/admin" className="underline hover:text-primary">
          Back to places
        </Link>
      </Page>
    )
  }

  return <PlaceView place={toApiPlace(placeQuery.data)} placeId={id} preview />
}
