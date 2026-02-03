import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/coc-dashboard-pub/',
  plugins: [react()],
})
