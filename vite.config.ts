import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/tectonic-for-the-win/',
  plugins: [react(), tailwindcss()],
  server: {
    host: '127.0.0.1',
    port: 7576,
    strictPort: true,
    // puma-dev proxies https://tectonic.test → :7576; Vite blocks unknown
    // Host headers by default.
    allowedHosts: ['tectonic.test'],
  },
})
