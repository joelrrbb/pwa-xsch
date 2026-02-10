import React, { useState } from 'react';
import { IonAlert } from '@ionic/react';

const FooterInstitucional = () => {
  const [showAlert, setShowAlert] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('user_session');
    window.location.reload();
  };

  return (
    <>
      <footer style={{
        width: '100%',
        padding: '20px 12px',
        textAlign: 'center',
        marginTop: 'auto',
        borderTop: '1px solid #ced4da',
      }}>
        <p style={{ 
          color: '#495057', 
          fontSize: '13px', 
          margin: '0', 
          lineHeight: '1.6',
          letterSpacing: '0.2px' 
        }}>
          Plataforma gestionada por el grupo de 
          <strong
            style={{ 
              color: '#fd7e14', 
              fontWeight: '700',
              cursor: 'pointer'
            }}
            onClick={() => setShowAlert(true)}
          >
            {' '}voluntarios
          </strong>.
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

      <IonAlert
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        header="Cerrar sesión"
        message="¿Deseas cerrar tu sesión actual?"
        buttons={[
          {
            text: 'Cancelar',
            role: 'cancel',
          },
          {
            text: 'Cerrar sesión',
            role: 'confirm',
			cssClass: 'alert-button-confirm',
            handler: handleLogout,
          }
        ]}
      />
    </>
  );
};

export default FooterInstitucional;
