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
    // Same-origin reverse proxy for Mimir analytics. Loading mimir.js
    // and /api/ingest under tectonic.test (instead of mimir.test) makes
    // the SDK first-party — bypasses tracker blocklists, Safari ITP,
    // and host-site CSP. See Mimir README "Same-origin reverse proxy".
    // Match both bare /_m/... (used by fetch from JS) and the base-prefixed
    // /tectonic-for-the-win/_m/... (used by the script tag, which Vite
    // rewrites with the `base` prefix).
    proxy: {
      '^(?:/tectonic-for-the-win)?/_m/script\\.js$': {
        target: 'https://mimir.test',
        changeOrigin: true,
        secure: false,
        rewrite: () => '/mimir.js',
      },
      '^(?:/tectonic-for-the-win)?/_m/api': {
        target: 'https://mimir.test',
        changeOrigin: true,
        secure: false,
        rewrite: (p) =>
          p.replace(/^\/tectonic-for-the-win/, '').replace(/^\/_m/, ''),
      },
    },
  },
})
