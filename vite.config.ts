import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'
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
          enabled: false, // enable SSR
        },
      }),
      viteReact(),
      nitro(),
    ],
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
