import { Link, createFileRoute } from '@tanstack/react-router'
import { useApiAdminPlacesQuery } from '#/api/admin/use-places-query'
import { AdminImportPlaceButton } from '#/components/admin/admin-import-place-button'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Spinner } from '#/components/ui/spinner'

export const Route = createFileRoute('/admin/')({
  component: AdminPlacesPage,
})

function AdminPlacesPage() {
  const apiAdminPlacesQuery = useApiAdminPlacesQuery()

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold">Places</h2>
        <div className="flex items-center gap-2">
          <AdminImportPlaceButton />
          <Button
            nativeButton={false}
            render={<Link to="/admin/place/$id" params={{ id: 'new' }} />}
          >
            New place
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Import creates a draft. Export a place from its editor to move it
        between environments (e.g. staging → prod).
      </p>

      {apiAdminPlacesQuery.isLoading && <Spinner />}

      {apiAdminPlacesQuery.data?.length === 0 && (
        <p className="text-sm text-muted-foreground">No places yet.</p>
      )}

      <ul className="flex flex-col divide-y rounded-md border">
        {apiAdminPlacesQuery.data?.map((place) => (
          <li key={place.id}>
            <Link
              to="/admin/place/$id"
              params={{ id: place.id }}
              className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-muted/50"
            >
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-medium">{place.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {place.id} · {place.location}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-3 text-xs">
                <Badge
                  variant={place.is_published ? 'default' : 'secondary'}
                  className={
                    place.is_published
                      ? 'bg-green-100 text-green-800'
                      : undefined
                  }
                >
                  {place.is_published ? 'published' : 'draft'}
                </Badge>
                <span className="text-muted-foreground">
                  {place.gallery.length} photos
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
