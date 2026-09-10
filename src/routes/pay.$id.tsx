import { createFileRoute, Link } from '@tanstack/react-router'
import { CheckoutElementsProvider } from '@stripe/react-stripe-js/checkout'
import { loadStripe } from '@stripe/stripe-js'
import { useApiPaymentsCreateCheckoutSessionMutation } from '#/api/payments/use-api-payments-create-checkout-session-mutation'
import { useEffect } from 'react'
import CheckoutForm from '#/components/checkout-form'
import { Page } from '#/components/page'
import { Spinner } from '#/components/ui/spinner'
import { Button } from '#/components/ui/button'
import { NotFoundComponent } from '#/components/not-found-component'
import { CheckCircle2Icon, ShieldCheckIcon } from 'lucide-react'
import { useApiPlaceQuery } from '#/api/places/use-api-place-query'

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
  const { id: token } = Route.useParams()
  const apiCreateSessionMutation = useApiPaymentsCreateCheckoutSessionMutation()

  useEffect(() => {
    apiCreateSessionMutation.mutate(token)
  }, [token])

  const placeId = apiCreateSessionMutation.data?.place_id ?? ''
  const placeQuery = useApiPlaceQuery(placeId)
  const place = placeQuery.data
  const plan = apiCreateSessionMutation.data?.plan
  const priceLabel = plan
    ? new Intl.NumberFormat('pl-PL', {
        style: 'currency',
        currency: plan.currency,
        maximumFractionDigits: 0,
      }).format(plan.amount / 100)
    : null
  const periodLabel = plan?.interval === 'year' ? 'rok' : 'miesiąc'

  if (apiCreateSessionMutation.isPending) {
    return (
      <Page className="flex min-h-screen items-center justify-center">
        <Spinner className="size-12" />
      </Page>
    )
  }

  if (apiCreateSessionMutation.isError) {
    return (
      <Page className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p role="alert" className="text-sm text-destructive">
          Ten link płatności jest nieprawidłowy lub wygasł.
        </p>
        <Button
          variant="outline"
          onClick={() => apiCreateSessionMutation.mutate(token)}
        >
          Spróbuj ponownie
        </Button>
      </Page>
    )
  }

  if (placeId && placeQuery.isPending) {
    return (
      <Page className="flex min-h-screen items-center justify-center">
        <Spinner className="size-12" />
      </Page>
    )
  }
  if (placeQuery.isError || !place) {
    return <NotFoundComponent />
  }

  const clientSecret = apiCreateSessionMutation.data?.client_secret

  return (
    <Page
      className="min-h-screen px-4 py-6"
      style={{ ['--primary' as string]: place.primary_color }}
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
                  style={{ color: place.primary_color }}
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
          {clientSecret && (
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
          <Link to="/tos" className="underline hover:text-primary">
            Regulamin
          </Link>{' '}
          i{' '}
          <Link to="/privacy-policy" className="underline hover:text-primary">
            Politykę prywatności
          </Link>
          .
        </p>
      </div>
    </Page>
  )
}
