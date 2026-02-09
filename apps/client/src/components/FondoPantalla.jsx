import React from 'react';

const FondoPantalla = ({ nombreImagen }) => {
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        height: '100dvh', // Altura dinámica para móviles modernos
        zIndex: -1,
        overflow: 'hidden',
        pointerEvents: 'none'
      }}
    >
      <img 
        src={`/${nombreImagen}`} 
        alt="Background" 
        style={{
          width: '100%',
          height: '100%',
          /* object-fit: cover es la clave para que no se deforme 
             y se ajuste a lo ancho y alto del móvil */
          objectFit: 'cover', 
          objectPosition: 'center',
          display: 'block'
        }}
      />
      {/* Capa de Glassmorphism para legibilidad */}
      <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]" />
    </div>
  );
};

export default FondoPantalla;