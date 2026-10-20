// Vite sets MODE from the `--mode` flag: "development" for `vite dev`,
// "production" for a plain `vite build`, "staging" for `--mode staging`.
const mode = import.meta.env.MODE

export type AppEnvironment = 'local' | 'staging' | 'prod'

export const appEnvironment: AppEnvironment =
  mode === 'production' ? 'prod' : mode === 'staging' ? 'staging' : 'local'

export const isProdEnvironment = appEnvironment === 'prod'

// The admin panel runs on the same origin as the guest pages, so the payment
// link does not need the backend to tell it the public URL.
export const getPublicWebUrl = () =>
  typeof window === 'undefined' ? '' : window.location.origin
