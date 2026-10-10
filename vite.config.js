import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The react plugin turns JSX into plain JavaScript and enables
// "hot module replacement": edit a file, the browser updates instantly.
export default defineConfig({
  plugins: [react()],
  server: { open: true }, // open the browser automatically on `npm run dev`
})
