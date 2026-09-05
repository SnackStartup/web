import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { existsSync, readFileSync } from 'node:fs'

export default defineConfig(({ command }) => {
  const keyPath = 'certs/dev-key.pem'
  const certPath = 'certs/dev-cert.pem'
  const useHttps =
    command === 'serve' && existsSync(keyPath) && existsSync(certPath)

  return {
    resolve: { tsconfigPaths: true },
    plugins: [
      devtools(),
      tailwindcss(),
      tanstackStart({
        spa: {
          enabled: true, // disable SSR
        },
      }),
      viteReact(),
      nitro(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'Stolik',
          short_name: 'Stolik',
          description: 'Stolik — Pod Kocim Ogonem',
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
          https: {
            key: readFileSync(keyPath),
            cert: readFileSync(certPath),
          },
        }
      : undefined,
  }
})
