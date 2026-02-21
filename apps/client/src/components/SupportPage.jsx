import React, { useState } from 'react';
import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar, 
  IonButtons, 
  IonBackButton, 
  IonIcon,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonText
} from '@ionic/react';
import { 
  logoWhatsapp, 
  peopleOutline, 
  colorPaletteOutline, 
  videocamOutline, 
  shareSocialOutline, 
  createOutline,
  checkmarkCircle
} from 'ionicons/icons';

const SupportPage = () => {
  const [selectedRole, setSelectedRole] = useState(null);

  const phoneNumber = "67621903"; 
  
  const volunteerRoles = [
    { id: 1, title: 'Coordinadores', desc: 'Gestión local', icon: peopleOutline },
    { id: 2, title: 'Escritores', desc: 'Contenido', icon: createOutline },
    { id: 3, title: 'Diseñadores', desc: 'Gráficos', icon: colorPaletteOutline },
    { id: 4, title: 'Editores', desc: 'Video', icon: videocamOutline },
    { id: 5, title: 'Social Media', desc: 'Redes', icon: shareSocialOutline }
  ];

  const handleSelect = (id) => {
    setSelectedRole(prevId => (prevId === id ? null : id));
  };

  const handleSendMessage = () => {
    const role = volunteerRoles.find(r => r.id === selectedRole);
    const roleText = role ? ` para el área de ${role.title}` : "";
    const message = encodeURIComponent(`¡Hola! Me gustaría postularme como voluntario${roleText}.`);
    window.location.assign(`https://wa.me/591${phoneNumber}?text=${message}`);
  };

  return (
    <IonPage>
      <IonHeader border="none">
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" text="Atrás" />
          </IonButtons>
          <IonTitle className="ys-text">Colaboradores</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {/* Sección de Títulos con más espacio */}
        <div style={{ textAlign: 'center', padding: '10px 20px 30px' }}>
          <h2 style={{ fontWeight: '800', fontSize: '1.6rem', marginBottom: '10px' }}>¡Únete al Equipo!</h2>
		  <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: '1.4' }}>
            Buscamos personas entusiastas que deseen integrar nuestros equipos de trabajo. 
            Selecciona tu área de interés para comenzar.
          </p>
        </div>

        {/* Contenedor con padding lateral aumentado */}
        <div style={{ padding: '0 15px' }}>
          <IonGrid style={{ padding: 0 }}>
            <IonRow>
              {volunteerRoles.map((role) => (
                <IonCol size="6" key={role.id} style={{ padding: '8px' }}> 
                  <div 
                    onClick={() => handleSelect(role.id)}
                    style={{
                      backgroundColor: selectedRole === role.id ? '#2dd36f' : '#f7fff8',
                      color: selectedRole === role.id ? 'white' : '#000',
                      border: '1.5px solid #2dd36f',
                      
                      // Cards más pequeñas y con padding interno generoso
                      padding: '20px 10px',
                      borderRadius: '20px',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '120px', 
                      transition: 'all 0.3s ease',
                      boxShadow: selectedRole === role.id ? '0 6px 12px rgba(45,211,111,0.2)' : 'none',
                      position: 'relative'
                    }}
                  >
                    {selectedRole === role.id && (
                      <IonIcon 
                        icon={checkmarkCircle} 
                        style={{ position: 'absolute', top: '8px', right: '8px', fontSize: '18px' }} 
                      />
                    )}
                    
                    <IonIcon 
                      icon={role.icon} 
                      style={{ 
                        fontSize: '26px', 
                        marginBottom: '8px',
                        color: selectedRole === role.id ? 'white' : '#2dd36f'
                      }} 
                    />
                    <IonText style={{ fontWeight: '700', fontSize: '0.85rem' }}>{role.title}</IonText>
                    <IonText style={{ fontSize: '0.7rem', marginTop: '4px', opacity: 0.8 }}>{role.desc}</IonText>
                  </div>
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
        </div>

        {/* Botón con padding lateral para que no toque los bordes */}
        <div style={{ marginTop: '40px', padding: '0 25px' }}>
          <IonButton 
            expand="block" 
            color="success" 
            disabled={!selectedRole}
            onClick={handleSendMessage}
            style={{ 
              '--border-radius': '16px',
              height: '54px',
              fontWeight: 'bold',
              boxShadow: '0 4px 10px rgba(45,211,111,0.2)'
            }}
          >
            <IonIcon slot="start" icon={logoWhatsapp} style={{ marginRight: '12px' }} />
            {selectedRole ? 'Enviar solicitud' : 'Selecciona una categoría'}
          </IonButton>
          
          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#999', marginTop: '20px' }}>
            Tu solicitud será procesada por nuestro equipo de coordinación.
          </p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SupportPage;