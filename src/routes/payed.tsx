import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { CheckCircle2Icon, ShieldCheckIcon } from 'lucide-react'
import { useEffect } from 'react'
import { useApiRetrieveCheckoutSessionQuery } from '#/api/useApiRetrieveCheckoutSessionQuery'
import { Page } from '#/components/Page'
import { Spinner } from '#/components/ui/spinner'
import { Button } from '#/components/ui/button'
import { places } from '#/data/places'
import type { Place } from '#/data/places'

export const Route = createFileRoute('/payed')({
  validateSearch: (search: Record<string, unknown>) => ({
    session_id: (search.session_id as string) || '',
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const { session_id } = Route.useSearch()
  const navigate = useNavigate()
  const checkoutSessionQuery = useApiRetrieveCheckoutSessionQuery(session_id)
  const placeId = checkoutSessionQuery.data?.place_id
  const place = placeId
    ? (places[placeId as keyof typeof places] as Place | undefined)
    : undefined

  useEffect(() => {
    if (!session_id) navigate({ to: '/' })
  }, [session_id, navigate])

  if (checkoutSessionQuery.isPending) {
    return (
      <Page className="flex min-h-screen items-center justify-center">
        <Spinner className="size-12" />
      </Page>
    )
  }

  if (checkoutSessionQuery.isError) {
    return (
      <Page className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-destructive">Nie udało się potwierdzić płatności.</p>
        <Link to="/">
          <Button variant="outline">Wróć na stronę główną</Button>
        </Link>
      </Page>
    )
  }

  return (
    <Page className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <CheckCircle2Icon className="size-20 text-green-500" />
      <h1 className="text-3xl font-bold text-primary">Płatność potwierdzona</h1>
      <p className="max-w-sm text-neutral-500">
        {place ? (
          <>
            Subskrypcja dla lokalu{' '}
            <strong className="text-primary">{place.name}</strong> jest aktywna.
          </>
        ) : (
          'Twoja subskrypcja jest aktywna.'
        )}
      </p>
      <p className="flex items-center gap-2 text-xs text-neutral-500">
        <ShieldCheckIcon className="size-4" />
        Potwierdzono bezpiecznie przez Stripe
      </p>
      <div className="mt-4 flex w-full max-w-xs flex-col gap-2">
        {placeId && (
          <Link to="/scanned/$id" params={{ id: placeId }}>
            <Button className="w-full">Przejdź do lokalu</Button>
          </Link>
        )}
        <Link to="/">
          <Button variant="outline" className="w-full">
            Wróć na stronę główną
          </Button>
        </Link>
      </div>
    </Page>
  )
}
