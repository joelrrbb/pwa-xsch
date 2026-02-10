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
      registerType: 'prompt', // Mantenemos prompt para que no reinicie solo
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
        // 1. Solo archivos esenciales en el precache. 
        // NO incluyas imágenes aquí si cambian seguido.
        globPatterns: ['**/*.{js,css,html,ico}'], 

        // 2. Manejo de caché "suave" para contenido dinámico
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'image',
            // 3. CAMBIO CLAVE: StaleWhileRevalidate
            // Sirve lo que hay en caché al instante, pero actualiza por detrás.
            handler: 'StaleWhileRevalidate', 
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 40, // Evita que la caché crezca infinito y crashee el móvil
                maxAgeSeconds: 60 * 60 * 24 * 7, // 1 semana de vida
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