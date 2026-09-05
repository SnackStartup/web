import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { Footer } from '#/components/Footer'
import { Analytics } from '@vercel/analytics/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PostHogProvider } from '@posthog/react'

import '../styles.css'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Stolik',
      },
    ],
    links: [{ rel: 'icon', href: '/icon.png' }],
  }),
  shellComponent: RootDocument,
})

const queryClient = new QueryClient()

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="font-sans antialiased [overflow-wrap:anywhere] min-h-screen flex flex-col">
        <PostHogProvider
          apiKey={import.meta.env.VITE_POSTHOG_PROJECT_TOKEN}
          options={{
            api_host: import.meta.env.VITE_POSTHOG_HOST,
            defaults: '2026-05-30',
            capture_exceptions: true,
          }}
        >
          <QueryClientProvider client={queryClient}>
            <div className="flex-1 flex flex-col">{children}</div>
            <Footer className="mt-16" />
            {import.meta.env.PROD && <Analytics />}
            {import.meta.env.DEV && (
              <TanStackDevtools
                config={{
                  position: 'bottom-right',
                }}
                plugins={[
                  {
                    name: 'Tanstack Router',
                    render: <TanStackRouterDevtoolsPanel />,
                  },
                ]}
              />
            )}
            <Scripts />
          </QueryClientProvider>
        </PostHogProvider>
      </body>
    </html>
  )
}
