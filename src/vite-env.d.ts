interface ViteTypeOptions {
  // By adding this line, you can make the type of ImportMetaEnv strict
  // to disallow unknown keys.
  // strictImportMetaEnv: unknown
}

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_API_LAN_URL: string
  readonly VITE_API_PROXY_URL: string
  readonly VITE_POSTHOG_PROJECT_TOKEN: string
  readonly VITE_POSTHOG_HOST: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
