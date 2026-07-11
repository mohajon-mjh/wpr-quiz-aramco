import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/wpr-quiz-aramco/',
  build: {
    outDir: 'docs',
    assetsDir: 'assets',
    sourcemap: true
  }
})
