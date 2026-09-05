type EventProps = Record<string, unknown>

let posthog: import('posthog-js').PostHog | null = null
let buffer: Array<{ event: string; props?: EventProps }> = []
let initPromise: Promise<void> | null = null

export const initAnalytics = () => {
  if (!import.meta.env.VITE_POSTHOG_PROJECT_TOKEN || initPromise) return
  initPromise = (async () => {
    const { default: posthogJs } = await import('posthog-js')
    posthogJs.init(import.meta.env.VITE_POSTHOG_PROJECT_TOKEN, {
      api_host: import.meta.env.VITE_POSTHOG_HOST,
      defaults: '2026-05-30',
      capture_exceptions: true,
    })
    posthog = posthogJs
    for (const { event, props } of buffer) posthog.capture(event, props)
    buffer = []
  })()
}

export const analyticsCapture = (event: string, props?: EventProps) => {
  if (posthog) {
    posthog.capture(event, props)
  } else {
    buffer.push({ event, props })
  }
}
