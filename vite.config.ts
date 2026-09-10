import { defineConfig, loadEnv } from 'vite'
import type { Plugin, ViteDevServer } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { existsSync, readFileSync } from 'node:fs'
import { generateGalleryManifest } from './scripts/generate-gallery-manifest.ts'

const debounce = <T>(fn: () => T, ms: number) => {
  let t: ReturnType<typeof setTimeout> | undefined
  return () => {
    clearTimeout(t)
    t = setTimeout(fn, ms)
  }
}

const galleryManifest = (): Plugin => ({
  name: 'gallery-manifest',
  buildStart() {
    generateGalleryManifest()
  },
  configureServer(server: ViteDevServer) {
    const regen = debounce(() => generateGalleryManifest(), 200)
    server.watcher.on('all', (_event, path) => {
      if (path?.includes('public/places')) regen()
    })
  },
})

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const ngrokHost = env.HMR_HOST
  const backendUrl = env.VITE_API_URL

  const keyPath = 'certs/dev-key.pem'
  const certPath = 'certs/dev-cert.pem'
  const useHttps =
    command === 'serve' && existsSync(keyPath) && existsSync(certPath)

  return {
    resolve: { tsconfigPaths: true },
    plugins: [
      devtools(),
      tailwindcss(),
      galleryManifest(),
      tanstackStart({
        spa: {
          enabled: true, // disable SSR
        },
      }),
      viteReact(),
      nitro({
        ...(mode === 'development'
          ? { routeRules: { '/api/**': { proxy: `${backendUrl}/**` } } }
          : {}),
      }),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'Stolik',
          short_name: 'Stolik',
          description: 'Stolik',
          start_url: '/',
          display: 'standalone',
          theme_color: '#d33886',
          background_color: '#ffffff',
          icons: [{ src: '/icon-96.png', sizes: '96x96', type: 'image/png' }],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,webp,png,jpg,jpeg,woff2}'],
          navigateFallback: '/',
          cleanupOutdatedCaches: true,
        },
      }),
    ],
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: 'posthog',
                test: /node_modules[\\/]posthog-js[\\/]/,
              },
            ],
          },
        },
      },
    },
    server: useHttps
      ? {
          ...(mode === 'development'
            ? {
                proxy: {
                  '/api': {
                    target: backendUrl,
                    changeOrigin: true,
                    secure: false, // mkcert self-signed (dev only)
                  },
                },
              }
            : {}),
          https: {
            key: readFileSync(keyPath),
            cert: readFileSync(certPath),
          },
          ...(ngrokHost
            ? { hmr: { host: ngrokHost, protocol: 'wss', clientPort: 443 } }
            : {}),
        }
      : undefined,
  }
})
