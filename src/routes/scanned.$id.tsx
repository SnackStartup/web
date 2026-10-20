import { Page } from '#/components/page'
import { createFileRoute } from '@tanstack/react-router'
import { Spinner } from '#/components/ui/spinner'
import { NotFoundComponent } from '#/components/not-found-component'
import { PlaceView } from '#/components/place-view'
import { useApiPlaceQuery } from '#/api/places/use-api-place-query'

export const Route = createFileRoute('/scanned/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id: placeId } = Route.useParams()
  const placeQuery = useApiPlaceQuery(placeId)
  const place = placeQuery.data

  if (placeQuery.isPending) {
    return (
      <Page className="flex min-h-screen items-center justify-center">
        <Spinner className="size-12" />
      </Page>
    )
  }
  if (placeQuery.isError || !place) {
    return <NotFoundComponent />
  }

  return (
    <PlaceView
      place={place}
      placeId={placeId}
      onPlaceRefetch={() => void placeQuery.refetch()}
    />
  )
}
