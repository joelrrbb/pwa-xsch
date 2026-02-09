import { useState, useEffect } from 'react';

export function usePoints() {
  const [points, setPoints] = useState(() => {
    const saved = localStorage.getItem('user_session');
    return saved ? JSON.parse(saved).points || 0 : 0;
  });

  useEffect(() => {
    const handlePointsUpdate = () => {
      const saved = localStorage.getItem('user_session');
      if (saved) {
        setPoints(JSON.parse(saved).points || 0);
      }
    };

    // Escuchamos el evento personalizado
    window.addEventListener('points-updated', handlePointsUpdate);
    return () => window.removeEventListener('points-updated', handlePointsUpdate);
  }, []);

  // Función para actualizar los puntos desde cualquier sitio
  const updatePoints = (newPoints) => {
    const saved = localStorage.getItem('user_session');
    if (saved) {
      const session = JSON.parse(saved);
      const updatedSession = { ...session, points: newPoints };
      localStorage.setItem('user_session', JSON.stringify(updatedSession));
      
      // Disparamos el evento para que todos los componentes se enteren
      window.dispatchEvent(new Event('points-updated'));
    }
  };

  return { points, updatePoints };
}