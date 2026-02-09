import React from 'react';
import { usePoints } from '../hooks/usePoints';

const PointsDisplay = () => {
  const { points } = usePoints();

  return (
    <div style={styles.pointsBadge}>
      {/* Círculo con gradiente Verde Fosforescente */}
      <div style={styles.iconCircle}>
        <span style={styles.starIcon}>⭐</span>
      </div>
      <div style={styles.textContainer}>
        <span style={styles.pointsValue}>{points}</span>
        <span style={styles.pointsLabel}>PUNTOS</span>
      </div>
    </div>
  );
};

const styles = {
  pointsBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    background: '#1a1a1a', 
    padding: '6px 14px 6px 8px',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
  },
  iconCircle: {
    // Gradiente verde fosforescente vibrante
    background: 'linear-gradient(135deg, #2eff2e 0%, #17ad17 100%)', 
    width: '26px', // Un poquito más grande para que luzca el verde
    height: '26px',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 0 10px rgba(46, 255, 46, 0.4)', // Resplandor verde
  },
  starIcon: {
    fontSize: '14px',
    filter: 'brightness(0) saturate(100%) invert(100%)', // Opcional: hace la estrella blanca para que contraste con el verde, o déjala normal si prefieres el emoji original
  },
  textContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    lineHeight: '1',
  },
  pointsValue: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: '1.1rem',
    letterSpacing: '0.5px',
  },
  pointsLabel: {
    color: '#2eff2e', // Verde fosforescente para el label
    fontWeight: '800',
    fontSize: '0.55rem',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginTop: '2px',
  }
};

export default PointsDisplay;