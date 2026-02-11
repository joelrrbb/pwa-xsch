import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: {
    host: true, // Permite acceder desde la IP de tu red local
	allowedHosts: [
      '.trycloudflare.com' // El dominio de tu túnel
    ],
	proxy: {
      '/api': 'http://localhost:3001'
    }
  },
  plugins: [
    react(),
    VitePWA({
      // Estrategia de actualización: 'autoUpdate' refresca la app automáticamente
      registerType: 'prompt',
      
      // Habilita el Service Worker durante el desarrollo (vital para probar notificaciones)
      devOptions: {
        enabled: true,
        type: 'module'
      },

      // Configuración del archivo manifest (lo que hace que sea instalable)
      manifest: {
        name: 'XS-CH',
        short_name: 'XS-CH',
        theme_color: '#ffffff',//barra superior
        background_color: '#ffffff',
        display: 'standalone', // Se abre como una app nativa, sin barra de navegador
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
            purpose: 'any maskable' // Importante para iconos en Android
          }
        ]
      },

      // Configuración del Service Worker (Workbox)
      workbox: {
        globPatterns: [],
		navigateFallback: '/index.html',
      }
    })
  ],
})
