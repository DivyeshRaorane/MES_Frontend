import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

// Stub used to satisfy Node core modules that browser-shipped libraries (e.g.
// SheetJS/xlsx) reference but never actually exercise in our code paths. This
// silences Vite's "module externalized for browser compatibility" warning.
const emptyStub = fileURLToPath(new URL('./src/config/emptyModule.js', import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      stream: emptyStub,
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    hmr: true,
    allowedHosts: true
  }
})
