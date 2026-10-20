import {
  Link,
  Outlet,
  createFileRoute,
  useRouterState,
} from '@tanstack/react-router'
import { GoogleLogin } from '@react-oauth/google'
import { useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { ArrowLeft, Home } from 'lucide-react'
import { useAdminMeQuery } from '#/api/admin/client'
import { useApiGoogleAuthMutation } from '#/api/auth/use-api-google-auth-mutation'
import { useLogoutMutation } from '#/api/auth/use-logout-mutation'
import { Spinner } from '#/components/ui/spinner'

export const Route = createFileRoute('/admin')({
  component: AdminLayout,
})

const backButtonClass =
  'mt-0.5 grid size-9 shrink-0 place-items-center rounded border text-neutral-600 transition-colors hover:bg-neutral-100'

function AdminLayout() {
  const queryClient = useQueryClient()
  const me = useAdminMeQuery()
  const auth = useApiGoogleAuthMutation()
  const logout = useLogoutMutation()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const isPlaceEditor = pathname.startsWith('/admin/place')

  if (me.isLoading) {
    return (
      <main className="grid min-h-dvh place-items-center">
        <Spinner />
      </main>
    )
  }

  if (!me.data) {
    const status = isAxiosError(me.error)
      ? me.error.response?.status
      : undefined

    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-lg font-semibold">Stolik Admin Panel</h1>
        {status === 403 ? (
          <p className="text-sm text-neutral-500">
            This Google account is not an administrator.
          </p>
        ) : (
          <>
            <p className="text-sm text-neutral-500">
              Sign in with an account on the administrator list.
            </p>
            <GoogleLogin
              onSuccess={async (response) => {
                if (!response.credential) return
                await auth.mutateAsync({ idToken: response.credential })
                await queryClient.invalidateQueries({
                  queryKey: ['admin', 'me'],
                })
              }}
              onError={() => undefined}
            />
          </>
        )}
        <Link to="/" className="text-sm underline">
          Back to the site
        </Link>
      </main>
    )
  }

  const isProd = me.data.environment === 'prod'

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-8">
      <header className="mb-8 flex items-start gap-3">
        <div className="flex shrink-0 items-center gap-2">
          {isPlaceEditor ? (
            <Link
              to="/admin"
              aria-label="Back to places"
              title="Back to places"
              className={backButtonClass}
            >
              <ArrowLeft className="size-4" />
            </Link>
          ) : (
            <Link
              to="/"
              aria-label="Back to the site"
              title="Back to the site"
              className={backButtonClass}
            >
              <Home className="size-4" />
            </Link>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col items-end gap-2">
          <div className="flex max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <Link to="/admin" className="text-xl font-semibold">
              Stolik Admin Panel
            </Link>
            <span
              className={
                isProd
                  ? 'rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white uppercase'
                  : 'rounded bg-amber-400 px-2 py-0.5 text-xs font-bold text-black uppercase'
              }
            >
              {me.data.environment}
            </span>
          </div>
          <div className="flex min-w-0 max-w-full items-center gap-3">
            <span className="truncate text-xs text-neutral-500">
              {me.data.email}
            </span>
            <button
              type="button"
              disabled={logout.isPending}
              onClick={() => logout.mutate()}
              className="shrink-0 rounded border px-3 py-1.5 text-sm disabled:opacity-50"
            >
              {logout.isPending ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </div>
      </header>
      <Outlet />
    </main>
  )
}
