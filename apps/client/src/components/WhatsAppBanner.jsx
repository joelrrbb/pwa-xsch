import React from 'react';
import { IonIcon, IonText, IonButton } from '@ionic/react';
import { logoWhatsapp } from 'ionicons/icons';

const WhatsAppBanner = () => {
  // Lógica para obtener el teléfono desde localStorage
  const getManagerPhone = () => {
    const session = localStorage.getItem('user_session');
    if (session) {
      try {
        const parsed = JSON.parse(session);
        return parsed.manager_phone || '67621903'; 
      } catch (e) {
        console.error("Error parseando sesión", e);
        return '67621903';
      }
    }
    return '67621903';
  };

  const managerPhone = getManagerPhone();

  const handleSendClick = () => {
    // Limpia el número de caracteres no numéricos
    const cleanPhone = managerPhone.toString().replace(/\D/g, '');
    window.location.assign(`https://wa.me/591${cleanPhone}`);
  };

  return (
    <div style={{
      background: '#f0f2f5',
      borderRadius: '16px',
      padding: '14px',
      margin: '10px 0 20px 0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
        <div style={{ 
                background: '#fff', 
                borderRadius: '50%', 
                padding: '8px', 
                boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                display: 'flex'
              }}>
                <IonIcon icon={logoWhatsapp} style={{ fontSize: '28px', color: '#25D366' }} />
              </div>
        
        
		
		
		<div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
  <IonText style={{ fontSize: '0.85rem', color: '#4b4b4b' }}>
    Envía tus capturas al número
	</IonText>
  <IonText style={{ 
    fontSize: '18px',   // Tamaño destacado
    fontWeight: '600', 
    color: '#1a1a1a', 
  }}>
    +591 {managerPhone}
  </IonText>
</div>


      </div>

      <IonButton 
        size="small"
		color="success"
        style={{ 
          '--color': '#fff',         
          fontWeight: 'bold',
        }}
        onClick={handleSendClick}
      >
        ENVIAR
      </IonButton>
    </div>
  );
};

export default WhatsAppBanner;