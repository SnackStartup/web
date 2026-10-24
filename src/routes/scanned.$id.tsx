import { Page } from '#/components/page'
import { createFileRoute } from '@tanstack/react-router'
import { Spinner } from '#/components/ui/spinner'
import { NotFoundComponent } from '#/components/not-found-component'
import { PlaceView } from '#/components/place-view'
import { useApiPlaceQuery } from '#/api/places/use-place-query'

export const Route = createFileRoute('/scanned/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id: placeId } = Route.useParams()
  const apiPlaceQuery = useApiPlaceQuery(placeId)
  const place = apiPlaceQuery.data

  if (apiPlaceQuery.isPending) {
    return (
      <Page className="flex min-h-screen items-center justify-center">
        <Spinner className="size-12" />
      </Page>
    )
  }
  if (apiPlaceQuery.isError || !place) {
    return <NotFoundComponent />
  }

  return (
    <PlaceView
      place={place}
      placeId={placeId}
      onPlaceRefetch={() => void apiPlaceQuery.refetch()}
    />
  )
}
