import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { registerSW } from 'virtual:pwa-register'

// Configuramos el registro de forma más controlada
const updateSW = registerSW({
  onNeedRefresh() {
    // Aquí podrías mostrar un aviso al usuario
    // Si decides mantener autoUpdate, esto se puede dejar vacío, 
    // pero evita el 'immediate: true' si te da problemas de bucle.
    if (confirm('Nueva versión disponible. ¿Recargar?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('App lista para trabajar offline');
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)