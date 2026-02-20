import { useState } from 'react';

/**
 * Hook para manejar la lógica de modales que solo se ven una vez
 * @param {string} key - Nombre único para el localStorage (ej: 'promo_v1')
 * @param {boolean} condition - Condición extra (ej: user.is_verified === 2)
 */
export function useOneTimeModal(key, condition = true) {
  const [isOpen, setIsOpen] = useState(() => {
    const hasSeen = localStorage.getItem(key);
    // Si ya lo vio, siempre es false. Si no, depende de la condición.
    if (hasSeen === 'true') return false;
    return condition;
  });

  const close = () => {
    setIsOpen(false);
    localStorage.setItem(key, 'true');
  };

  return [isOpen, close];
}