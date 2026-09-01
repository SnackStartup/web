import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'
import { readFileSync } from 'node:fs'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackStart({
      spa: {
        enabled: true,
      },
    }),
    viteReact(),
    nitro(),
  ],
  server: {
    host: true,
    port: 3000,
    https: {
      key: readFileSync('certs/dev-key.pem'),
      cert: readFileSync('certs/dev-cert.pem'),
    },
  },
})

export default config
