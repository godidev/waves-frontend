import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (!id.includes('node_modules')) return

          if (id.includes('react-leaflet') || id.includes('/leaflet/')) {
            return 'vendor-leaflet'
          }

          if (id.includes('/recharts/')) {
            return 'vendor-recharts'
          }

          if (id.includes('/react-router') || id.includes('/@remix-run/')) {
            return 'vendor-router'
          }
        },
      },
    },
  },
})
