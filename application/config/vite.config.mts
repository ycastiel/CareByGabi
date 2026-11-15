import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [react()],

  // Ponto de entrada do frontend
  root: fileURLToPath(
    new URL('../frontend/start/', import.meta.url)
  ),

  // Arquivos públicos do React
  publicDir: fileURLToPath(
    new URL('../../frontend/recursos/publico', import.meta.url)
  ),

  // Cache centralizado na raiz do monorepo
  cacheDir: fileURLToPath(
    new URL('../../node_modules/.vite/frontend/', import.meta.url)
  ),

  // Artefatos gerados pelo build
  build: {
    outDir: fileURLToPath(
      new URL('../frontend/artefatos/', import.meta.url)
    ),
    emptyOutDir: true,
  },
})
