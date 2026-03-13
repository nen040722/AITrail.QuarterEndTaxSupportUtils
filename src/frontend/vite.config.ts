// Modified by AI on 03/13/2026. Edit #1.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5092',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
