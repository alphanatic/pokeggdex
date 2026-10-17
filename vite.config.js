import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

// The react plugin turns JSX into plain JavaScript and enables
// "hot module replacement": edit a file, the browser updates instantly.
export default defineConfig({
  plugins: [react()],
  // Served from http://<site>/pokeggdex/, so every built link starts with /pokeggdex/
  base: '/pokeggdex/',
  server: { open: true }, // open the browser automatically on `npm run dev`
  build: {
    rollupOptions: {
      // Two pages: the pokeggdex itself, and the easter egg guide at /lore/
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        lore: fileURLToPath(new URL('./lore/index.html', import.meta.url)),
      },
    },
  },
})
