import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

const caminho = (relativo: string) => fileURLToPath(new URL(relativo, import.meta.url))

export default defineConfig({
  plugins: [react()],
  root: caminho('../frontend/start/'),
  publicDir: caminho('../../frontend/public/'),
  cacheDir: caminho('../../node_modules/.vite/frontend/'),
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: caminho('../frontend/artefatos/'),
    emptyOutDir: true,
  },
})
