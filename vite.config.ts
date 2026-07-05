import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

function buildApiUrlMatcher(apiBaseUrl: string) {
  try {
    const apiUrl = new URL(apiBaseUrl)
    const origin = apiUrl.origin
    const prefix = apiUrl.pathname.replace(/\/$/, '')

    return ({ url }: { url: URL }) =>
      url.origin === origin && url.pathname.startsWith(prefix || '/')
  } catch {
    return ({ url }: { url: URL }) => url.pathname.startsWith('/api')
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const appName = env.VITE_APP_NAME || 'Aidara'
  const apiBaseUrl = env.VITE_API_BASE_URL || 'http://localhost:8000/api'

  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: null,
        includeAssets: [
          'icons/apple-touch-icon.png',
          'icons/logo-96x96.png',
          'icons/logo.png',
        ],
        manifest: {
          name: appName,
          short_name: appName,
          description: 'Aidara Mobile — Sistem Informasi Keolahragaan',
          theme_color: '#2563EB',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: 'icons/logo-96x96.png',
              sizes: '96x96',
              type: 'image/png',
            },
            {
              src: 'icons/logo-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'icons/logo-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable',
            },
            {
              src: 'icons/logo-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'icons/logo-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,webmanifest}'],
          navigateFallback: 'index.html',
          runtimeCaching: [
            {
              urlPattern: buildApiUrlMatcher(apiBaseUrl),
              handler: 'NetworkFirst',
              options: {
                cacheName: 'aidara-api-cache',
                networkTimeoutSeconds: 10,
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 5,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    assetsInclude: ['**/*.svg', '**/*.csv'],
    build: {
      outDir: 'dist',
      sourcemap: false,
      target: 'es2020',
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router'],
            query: ['@tanstack/react-query'],
            charts: ['recharts'],
          },
        },
      },
    },
  }
})
