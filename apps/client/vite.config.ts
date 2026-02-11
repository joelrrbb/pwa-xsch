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
      // 1. Cambiamos a 'prompt' para que no recargue solo, o 'autoUpdate' con caché vacío
      registerType: 'autoUpdate',
      
      // 2. Deshabilitamos el Service Worker en desarrollo para evitar el loop local
      devOptions: {
        enabled: false 
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

      // 3. CONFIGURACIÓN PARA NO CACHEAR NADA
      workbox: {
        // No pre-cacheamos ningún archivo
        globPatterns: [], 
        // No cacheamos nada en tiempo de ejecución
        runtimeCaching: [],
        // Forzamos a que el SW no tome el control de las peticiones
        navigationPreload: false,
      }
    })
  ],
})