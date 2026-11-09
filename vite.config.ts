import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// `base: './'` keeps every asset path relative, so the built site works
// from any folder (GitHub Pages project sites, a file share, a preview host).
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})
