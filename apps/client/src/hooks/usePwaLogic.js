import { useState, useEffect } from 'react';

export function usePwaLogic() {
  const [status, setStatus] = useState('checking'); // 'checking' | 'pwa' | 'browser_installed' | 'browser_not_installed'

  useEffect(() => {
    const checkStatus = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
      
      if (isStandalone) {
        // Si entra AQUÍ, guardamos de una vez que ya está instalada para el futuro
        localStorage.setItem('pwa_is_installed', 'true');
        setStatus('pwa');
      } else {
        // Si entra por NAVEGADOR, revisamos nuestra marca de persistencia
        const wasInstalled = localStorage.getItem('pwa_is_installed') === 'true';
        setStatus(wasInstalled ? 'browser_installed' : 'browser_not_installed');
      }
    };

    // 1. Ejecutar al cargar
    checkStatus();

    // 2. Escuchar el evento de éxito de instalación (solo dispara en Chrome/Android)
    const handleAppInstalled = () => {
      localStorage.setItem('pwa_is_installed', 'true');
      setStatus('browser_installed');
    };

    window.addEventListener('appinstalled', handleAppInstalled);
    return () => window.removeEventListener('appinstalled', handleAppInstalled);
  }, []);

  return status;
}