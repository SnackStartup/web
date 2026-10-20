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
import { useApiAdminMeQuery } from '#/api/admin/use-me-query'
import { useApiGoogleAuthMutation } from '#/api/auth/use-google-auth-mutation'
import { useApiLogoutMutation } from '#/api/auth/use-logout-mutation'
import { adminKeys } from '#/api/query-keys'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Spinner } from '#/components/ui/spinner'
import { appEnvironment, isProdEnvironment } from '#/lib/env'

export const Route = createFileRoute('/admin')({
  component: AdminLayout,
})

function AdminLayout() {
  const queryClient = useQueryClient()
  const apiAdminMeQuery = useApiAdminMeQuery()
  const apiGoogleAuthMutation = useApiGoogleAuthMutation()
  const apiLogoutMutation = useApiLogoutMutation()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const isPlaceEditor = pathname.startsWith('/admin/place')

  if (apiAdminMeQuery.isLoading) {
    return (
      <main className="grid min-h-dvh place-items-center">
        <Spinner />
      </main>
    )
  }

  if (!apiAdminMeQuery.data) {
    const status = isAxiosError(apiAdminMeQuery.error)
      ? apiAdminMeQuery.error.response?.status
      : undefined

    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-lg font-semibold">Stolik Admin Panel</h1>
        {status === 403 ? (
          <p className="text-sm text-muted-foreground">
            This Google account is not an administrator.
          </p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Sign in with an account on the administrator list.
            </p>
            <GoogleLogin
              onSuccess={async (response) => {
                if (!response.credential) return
                await apiGoogleAuthMutation.mutateAsync({
                  idToken: response.credential,
                })
                await queryClient.invalidateQueries({
                  queryKey: adminKeys.me,
                })
              }}
              onError={() => undefined}
            />
          </>
        )}
        <Button variant="link" nativeButton={false} render={<Link to="/" />}>
          Back to the site
        </Button>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-8">
      <header className="mb-8 flex items-start gap-3">
        <div className="flex shrink-0 items-center gap-2">
          {isPlaceEditor ? (
            <Button
              variant="outline"
              size="icon"
              nativeButton={false}
              aria-label="Back to places"
              title="Back to places"
              render={<Link to="/admin" />}
            >
              <ArrowLeft />
            </Button>
          ) : (
            <Button
              variant="outline"
              size="icon"
              nativeButton={false}
              aria-label="Back to the site"
              title="Back to the site"
              render={<Link to="/" />}
            >
              <Home />
            </Button>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col items-end gap-2">
          <div className="flex max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <Link to="/admin" className="text-xl font-semibold">
              Stolik Admin Panel
            </Link>
            <Badge
              className={
                isProdEnvironment
                  ? 'bg-red-600 font-bold text-white uppercase'
                  : 'bg-amber-400 font-bold text-black uppercase'
              }
            >
              {appEnvironment}
            </Badge>
          </div>
          <div className="flex min-w-0 max-w-full items-center gap-3">
            <span className="truncate text-xs text-muted-foreground">
              {apiAdminMeQuery.data.email}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={apiLogoutMutation.isPending}
              onClick={() => apiLogoutMutation.mutate()}
            >
              {apiLogoutMutation.isPending ? 'Signing out…' : 'Sign out'}
            </Button>
          </div>
        </div>
      </header>
      <Outlet />
    </main>
  )
}
