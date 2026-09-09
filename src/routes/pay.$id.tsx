import { createFileRoute, Link } from '@tanstack/react-router'
import { CheckoutElementsProvider } from '@stripe/react-stripe-js/checkout'
import { loadStripe } from '@stripe/stripe-js'
import { useApiCreateCheckoutSessionMutation } from '#/api/useApiCreateCheckoutSessionMutation'
import { useMemo } from 'react'
import CheckoutForm from '#/components/checkout-form'
import { Page } from '#/components/Page'
import { Spinner } from '#/components/ui/spinner'
import { Button } from '#/components/ui/button'
import { places } from '#/data/places'
import type { Place } from '#/data/places'
import { NotFoundComponent } from '#/components/NotFoundComponent'
import { CheckCircle2Icon, ShieldCheckIcon } from 'lucide-react'

export const Route = createFileRoute('/pay/$id')({
  component: RouteComponent,
})

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

const PLAN_FEATURES = [
  'Profil lokalu w aplikacji Stolik',
  'Materiały marketingowe z każdego obiadu',
  'Analizy skanów i zaangażowania gości',
  'Wsparcie techniczne i opieka wdrożeniowa',
]

function RouteComponent() {
  const { id: placeId } = Route.useParams()
  const place = places[placeId as keyof typeof places] as Place | undefined
  const apiCreateCheckoutSessionMutation = useApiCreateCheckoutSessionMutation()

  const clientSecret = useMemo(async () => {
    return apiCreateCheckoutSessionMutation
      .mutateAsync(placeId)
      .then((res) => res.client_secret)
  }, [placeId])

  const plan = apiCreateCheckoutSessionMutation.data?.plan
  const priceLabel = plan
    ? new Intl.NumberFormat('pl-PL', {
        style: 'currency',
        currency: plan.currency,
        maximumFractionDigits: 0,
      }).format(plan.amount / 100)
    : null
  const periodLabel = plan?.interval === 'year' ? 'rok' : 'miesiąc'

  if (!place) {
    return <NotFoundComponent />
  }

  return (
    <Page
      className="min-h-screen px-4 py-6"
      style={{ ['--primary' as string]: place.primaryColor }}
    >
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        {/* Place header */}
        <div className="flex flex-row items-center gap-3">
          <img
            src={`/places/${placeId}/logo-96.webp`}
            alt={place.name}
            className="size-12 rounded-full object-cover aspect-square"
          />
          <div className="flex flex-col">
            {place.suffix && (
              <span className="text-xs text-neutral-500">{place.suffix}</span>
            )}
            <h1 className="font-semibold text-primary">{place.name}</h1>
            <span className="text-xs text-neutral-500">{place.location}</span>
          </div>
        </div>

        {/* Subscription plan */}
        <section className="flex flex-col gap-4 rounded-2xl border p-5">
          <h2 className="text-2xl font-bold text-primary">
            {plan?.name ?? 'Plan Stolik'}
          </h2>
          <ul className="flex flex-col gap-2 text-sm">
            {PLAN_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <CheckCircle2Icon
                  className="mt-0.5 size-4 shrink-0"
                  style={{ color: place.primaryColor }}
                />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 border-t pt-4">
            <span className="text-3xl font-bold">{priceLabel ?? '—'}</span>
            <span className="text-sm text-neutral-500">
              / {periodLabel} · odnawia się automatycznie
            </span>
          </div>
        </section>

        {/* Payment */}
        <section className="flex flex-col gap-4">
          <h3 className="font-semibold">Płatność</h3>
          {apiCreateCheckoutSessionMutation.isPending && (
            <div className="flex items-center justify-center py-8">
              <Spinner />
            </div>
          )}
          {apiCreateCheckoutSessionMutation.isError && (
            <div className="flex flex-col gap-3">
              <p role="alert" className="text-sm text-destructive text-center">
                Nie udało się uruchomić płatności.
              </p>
              <Button
                variant="outline"
                onClick={() => apiCreateCheckoutSessionMutation.mutate(placeId)}
              >
                Spróbuj ponownie
              </Button>
            </div>
          )}
          {apiCreateCheckoutSessionMutation.isSuccess && (
            <CheckoutElementsProvider
              stripe={stripePromise}
              options={{ clientSecret }}
            >
              <CheckoutForm />
            </CheckoutElementsProvider>
          )}
          <p className="flex items-center justify-center gap-2 text-xs text-neutral-500">
            <ShieldCheckIcon className="size-6" />
            Płatność zabezpieczona przez Stripe. Anulujesz w każdej chwili.
          </p>
        </section>

        <p className="text-center text-xs text-neutral-500">
          Klikając w przycisk płatności, akceptujesz{' '}
          <Link to="/regulamin" className="underline hover:text-primary">
            Regulamin
          </Link>{' '}
          i{' '}
          <Link
            to="/polityka-prywatnosci"
            className="underline hover:text-primary"
          >
            Politykę prywatności
          </Link>
          .
        </p>
      </div>
    </Page>
  )
}
