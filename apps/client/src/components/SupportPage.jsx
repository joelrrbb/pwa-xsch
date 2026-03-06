import React, { useState, useEffect } from 'react';
import { 
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, 
  IonBackButton, IonIcon, IonButton, IonGrid, IonRow, IonCol, 
  IonText, IonModal, IonSpinner, useIonToast, IonItem, IonLabel, IonInput 
} from '@ionic/react';
import { 
  constructOutline, flashOutline, waterOutline, 
  brushOutline, homeOutline, checkmarkCircle,
  timeOutline, createOutline, arrowBackOutline, schoolOutline, cartOutline, carOutline
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom'; // Para la navegación
import { supabase } from '../supabaseClient';

const SupportPage = () => {
  const [present] = useIonToast();
  const history = useHistory();
  
  const [currentUser] = useState(() => {
    const saved = localStorage.getItem('user_session');
    return saved
      ? JSON.parse(saved)
      : { id: 'dcbc31f9-14e5-4757-8acf-7f5e11f7f797', phone: '700000', tier: 1, member_type: 1 };
  });

  const [selectedRole, setSelectedRole] = useState(null);
  const [customJob, setCustomJob] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [showWaitModal, setShowWaitModal] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);

  // EFECTO: Si ya tiene "job" en la sesión, mostrar modal de espera directamente
  useEffect(() => {
    if (currentUser?.job) {
      setCustomJob(currentUser.job);
      setShowWaitModal(true);
    }
  }, [currentUser]);

  const trades = [
    { id: 1, title: 'Constructor', icon: constructOutline },
    { id: 2, title: 'Transportista', icon: carOutline },
    { id: 3, title: 'Ama de casa', icon: homeOutline },
    { id: 4, title: 'Estudiante', icon: schoolOutline },
    { id: 5, title: 'Comerciante', icon: cartOutline },
    { id: 6, title: 'Otro', icon: createOutline }
  ];

  const handleSelect = (role) => {
    setSelectedRole(role.id);
    if (role.title === 'Otro') {
      setShowCustomModal(true);
    } else {
      setCustomJob(role.title);
    }
  };

  const handleRegisterJob = async () => {
    if (!currentUser?.id) {
      present({ message: 'Sesión no válida', color: 'danger', duration: 2000 });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('members')
        .update({ job: customJob })
        .eq('id', currentUser.id);

      if (error) throw error;

      // Actualizar el localStorage para que persista el cambio localmente
      const updatedSession = { ...currentUser, job: customJob };
      localStorage.setItem('user_session', JSON.stringify(updatedSession));

      setShowWaitModal(true);
    } catch (error) {
      present({ message: 'Error: ' + error.message, color: 'danger', duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader border="none">
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" text="Atrás" />
          </IonButtons>
          <IonTitle className="ys-text">Oficio</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <div style={{ textAlign: 'center', padding: '10px 20px 30px' }}>
          <h2 style={{ fontWeight: '800', fontSize: '1.6rem' }}>¡Únete al Equipo!</h2>
          <p style={{ color: '#666' }}>Selecciona tu área para continuar.</p>
          {selectedRole === 6 && customJob && (
            <div style={{ marginTop: '10px', color: '#4f46e5', fontWeight: 'bold' }}>
              Seleccionado: {customJob}
            </div>
          )}
        </div>

        <IonGrid>
          <IonRow>
            {trades.map((role) => (
              <IonCol size="6" key={role.id} style={{ padding: '8px' }}> 
                <div 
                  onClick={() => handleSelect(role)}
                  style={{
                    backgroundColor: selectedRole === role.id ? '#4f46e5' : '#f7f7f7',
                    color: selectedRole === role.id ? 'white' : '#000',
                    borderRadius: '20px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '110px', 
                    transition: 'all 0.3s ease',
                    border: selectedRole === role.id ? '2px solid #4f46e5' : '2px solid transparent'
                  }}
                >
                  <IonIcon icon={role.icon} style={{ fontSize: '28px', marginBottom: '8px' }} />
                  <IonText style={{ fontWeight: '700', fontSize: '0.9rem' }}>{role.title}</IonText>
                </div>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>

        <div style={{ marginTop: '40px', padding: '0 25px' }}>
          <IonButton 
            expand="block" 
            disabled={!selectedRole || loading || (selectedRole === 6 && !customJob)}
            onClick={handleRegisterJob}
            style={{ '--border-radius': '16px', height: '54px', fontWeight: 'bold' }}
          >
            {loading ? <IonSpinner name="crescent" /> : 'Confirmar'}
          </IonButton>
        </div>

        {/* MODAL PARA "OTRO" OFICIO */}
        <IonModal 
          isOpen={showCustomModal} 
          onDidDismiss={() => setShowCustomModal(false)}
          initialBreakpoint={0.4}
          breakpoints={[0, 0.4]}
        >
          <div className="ion-padding">
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontWeight: 'bold' }}>Tu Profesión</h2>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>¿A qué te dedicas?</p>
            </div>
            
            <IonItem fill="outline" className="rounded-2xl" style={{ marginBottom: '20px' }}>
              <IonLabel position="stacked">Escribe a que te dedicas</IonLabel>
              <IonInput 
                value={customJob}
                placeholder="Ej: Abogado, Mecánico..."
                style={{ fontSize: '20px', fontWeight: '600' }}
                onIonInput={e => setCustomJob(e.detail.value)}
              />
            </IonItem>

            <div style={{ marginTop: '20px', padding:'0 15px' }}>
				<IonButton expand="block" onClick={() => setShowCustomModal(false)}>
					Listo
				</IonButton>
			</div>
          </div>
        </IonModal>

        {/* MODAL DE ESPERA FINAL (CON BOTÓN ATRÁS) */}
        <IonModal isOpen={showWaitModal} backdropDismiss={false}>
          <div style={{ 
            height: '100%', display: 'flex', flexDirection: 'column', 
            alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px' 
          }}>
            <div style={{ background: '#fef3c7', padding: '30px', borderRadius: '50%', marginBottom: '20px' }}>
              <IonIcon icon={timeOutline} style={{ fontSize: '80px', color: '#d97706' }} />
            </div>
            <h2 className="ys-text" style={{ fontWeight: '800' }}>Nos pondremos en contacto</h2>
            <p style={{ color: '#64748b' }}>
              Tu perfil como <b>{customJob}</b> ha sido enviado.
            </p>

            <div style={{ width: '100%', marginTop: '40px' }}>
               <IonButton expand="block" onClick={() => {
					setShowWaitModal(false);
					history.push('/home');
				}} style={{ '--border-radius': '12px' }}>
                 <IonIcon icon={arrowBackOutline} slot="start" />
                 Regresar al Inicio
               </IonButton>
               
               <IonButton fill="clear" color="medium" onClick={() => setShowWaitModal(false)}>
                 Cerrar aviso
               </IonButton>
            </div>
          </div>
        </IonModal>

      </IonContent>
    </IonPage>
  );
};

export default SupportPage;