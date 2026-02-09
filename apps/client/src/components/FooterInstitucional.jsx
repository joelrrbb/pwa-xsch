import React from 'react';

const FooterInstitucional = () => {
  return (
    <footer style={{
      width: '100%',
      padding: '20px 12px',
      textAlign: 'center',
      marginTop: 'auto', // Empuja el footer al final si usas flexbox en el contenedor
      borderTop: '1px solid #ced4da', // Línea sutil para fondo plomo
    }}>
      <p style={{ 
        color: '#495057', 
        fontSize: '13px', 
        margin: '0', 
        lineHeight: '1.6',
        letterSpacing: '0.2px' 
      }}>
        Plataforma gestionada por el cuerpo de 
        <strong style={{ color: '#fd7e14', fontWeight: '700' }}> voluntarios</strong>.
        <br />
        <span style={{ 
          fontWeight: '800', 
          color: '#343a40', 
          textTransform: 'uppercase',
          fontSize: '14px' 
        }}>
          Por Siempre Chuquisaca
        </span>
      </p>
    </footer>
  );
};

export default FooterInstitucional;