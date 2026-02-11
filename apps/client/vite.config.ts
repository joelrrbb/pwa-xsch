import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: {
    host: true,
    allowedHosts: ['.trycloudflare.com'],
    proxy: {
      '/api': 'http://localhost:3001'
    }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // Se actualiza solo
      devOptions: {
        enabled: true,
        type: 'module'
      },
      manifest: {
        name: 'XS-CH',
        short_name: 'XS-CH',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'home-pwa.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'home-pwa.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // --- ESTO ES LO QUE ELIMINA EL PROMPT ---
        skipWaiting: true,      // Fuerza al nuevo SW a activarse de inmediato
        clientsClaim: true,     // El SW toma control de la página desde el segundo cero
        cleanupOutdatedCaches: true, // Borra caché viejo automáticamente
        // ----------------------------------------

        globPatterns: ['**/*.{js,css,html,ico}'], 
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'StaleWhileRevalidate', 
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 40,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            },
          },
        ],
      }
    })
  ],
})