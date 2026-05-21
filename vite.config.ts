import { defineConfig, loadEnv, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  // Mimir analytics config — read from .env files, with real environment
  // variables taking precedence so CI can inject it without a committed
  // .env. Dev points the URLs at the same-origin proxy paths below;
  // prod points them at a public Mimir host (set in the deploy workflow).
  const fileEnv = loadEnv(mode, process.cwd(), 'VITE_MIMIR_')
  const mimir = {
    token: process.env.VITE_MIMIR_TOKEN ?? fileEnv.VITE_MIMIR_TOKEN,
    script: process.env.VITE_MIMIR_SCRIPT_URL ?? fileEnv.VITE_MIMIR_SCRIPT_URL,
    endpoint: process.env.VITE_MIMIR_ENDPOINT ?? fileEnv.VITE_MIMIR_ENDPOINT,
    version:
      process.env.VITE_MIMIR_APP_VERSION ??
      fileEnv.VITE_MIMIR_APP_VERSION ??
      '',
  }

  // The Mimir SDK must be a parser-inserted <script> — it reads its own
  // data-* attributes via document.currentScript, which is null for
  // script elements created from JS. So it is injected into index.html
  // here. Emitted only when token + script URL + endpoint are all set;
  // otherwise the build ships with no analytics, cleanly.
  const mimirPlugin: PluginOption =
    mimir.token && mimir.script && mimir.endpoint
      ? {
          name: 'mimir-sdk',
          transformIndexHtml() {
            return [
              {
                tag: 'script',
                injectTo: 'head',
                attrs: {
                  src: mimir.script,
                  'data-token': mimir.token,
                  'data-endpoint': mimir.endpoint,
                  'data-app-version': mimir.version,
                  defer: true,
                },
              },
            ]
          },
        }
      : null

  return {
    // GitHub Pages serves under a sub-path; the Capacitor iOS bundle
    // loads from the app root. `vite build --mode capacitor` picks `/`.
    base: mode === 'capacitor' ? '/' : '/tectonic-legend/',
    plugins: [react(), tailwindcss(), mimirPlugin],
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
      // /tectonic-legend/_m/... (used by the script tag, which Vite
      // rewrites with the `base` prefix).
      proxy: {
        '^(?:/tectonic-legend)?/_m/script\\.js$': {
          target: 'https://mimir.test',
          changeOrigin: true,
          secure: false,
          rewrite: () => '/mimir.js',
        },
        '^(?:/tectonic-legend)?/_m/api': {
          target: 'https://mimir.test',
          changeOrigin: true,
          secure: false,
          rewrite: (p) =>
            p.replace(/^\/tectonic-legend/, '').replace(/^\/_m/, ''),
        },
      },
    },
  }
})
