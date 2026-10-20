import { createFileRoute } from '@tanstack/react-router'
import { useApiAdminPlaceQuery } from '#/api/admin/use-place-query'
import { AdminPlaceEditor } from '#/components/admin/admin-place-editor'
import { Spinner } from '#/components/ui/spinner'

export const Route = createFileRoute('/admin/place/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const isNew = id === 'new'
  const apiAdminPlaceQuery = useApiAdminPlaceQuery(isNew ? '' : id)

  if (!isNew && apiAdminPlaceQuery.isLoading) return <Spinner />
  if (!isNew && !apiAdminPlaceQuery.data) {
    return <p className="text-sm text-muted-foreground">Place not found.</p>
  }

  return (
    <AdminPlaceEditor key={id} isNew={isNew} place={apiAdminPlaceQuery.data} />
  )
}
