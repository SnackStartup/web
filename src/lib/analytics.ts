type EventProps = Record<string, unknown>

let posthog: import('posthog-js').PostHog | null = null
let buffer: Array<{ event: string; props?: EventProps }> = []
let initPromise: Promise<void> | null = null

export const initAnalytics = () => {
  if (!import.meta.env.VITE_POSTHOG_PROJECT_TOKEN || initPromise) return
  initPromise = new Promise<void>((resolve) => {
    const s = document.createElement('script')
    s.src = 'https://us-assets.i.posthog.com/static/array.js'
    s.async = true
    s.dataset.projectToken = import.meta.env.VITE_POSTHOG_PROJECT_TOKEN
    s.onload = () => {
      const w = window as unknown as Record<string, unknown>
      const ph = w['posthog'] as import('posthog-js').PostHog | undefined
      if (ph) {
        ph.init(import.meta.env.VITE_POSTHOG_PROJECT_TOKEN, {
          api_host: import.meta.env.VITE_POSTHOG_HOST,
          capture_exceptions: true,
        })
        posthog = ph
        for (const { event, props } of buffer) ph.capture(event, props)
        buffer = []
      }
      resolve()
    }
    s.onerror = () => resolve()
    document.head.appendChild(s)
  })
}

export const analyticsCapture = (event: string, props?: EventProps) => {
  if (posthog) {
    posthog.capture(event, props)
  } else {
    buffer.push({ event, props })
  }
}
