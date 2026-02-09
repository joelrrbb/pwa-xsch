import React, { useState, useEffect } from 'react';
import { 
  IonModal, IonContent, IonButton, IonHeader, IonToolbar, IonTitle,
  IonItem, IonLabel, IonInput, IonList, IonSpinner, IonText, IonIcon,
  IonDatetime, IonButtons
} from '@ionic/react';
import { timeOutline, alertCircleOutline, calendarOutline, logoFacebook, logoTiktok } from 'ionicons/icons';
import { supabase } from '../supabaseClient';

const VerificationModal = ({ isOpen, onVerified, memberId }) => {
  const [carnet, setCarnet] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [fechaTexto, setFechaTexto] = useState('Seleccionar');
  const [linkFb, setLinkFb] = useState('');
  const [linkTk, setLinkTk] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState(0);

  useEffect(() => {
    if (!memberId || !isOpen) return;

    const fetchMember = async () => {
      const { data, error } = await supabase
        .from('members')
        .select('is_verified, identity_card, birth_date, facebook_link, tiktok_link')
        .eq('id', memberId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching member:', error);
      } else if (data) {
        setStatus(data.is_verified || 0);
        setCarnet(data.identity_card || '');
        setFechaNacimiento(data.birth_date || '');
        setFechaTexto(data.birth_date ? new Date(data.birth_date + "T00:00:00").toLocaleDateString('es-ES') : 'Seleccionar');
        setLinkFb(data.facebook_link || '');
        setLinkTk(data.tiktok_link || '');
      }
    };

    fetchMember();
  }, [memberId, isOpen]);

  const handleDateChange = (e) => {
    const value = e.detail.value;
    if (value) {
      const dateOnly = value.split('T')[0];
      setFechaNacimiento(dateOnly);
      setFechaTexto(new Date(value).toLocaleDateString('es-ES'));
    }
  };

  const handleGuardar = async () => {
  // 1. Log para ver qué ID recibe el componente desde las props
  console.log("DEBUG: ID recibido en el Modal:", memberId);

  if (!memberId) {
    console.error("DEBUG: No se puede guardar porque memberId es null o undefined");
    setError('Sesión no válida.');
    return;
  }

  setLoading(true);
  setError('');

  const updateData = {
    id: memberId, 
    identity_card: carnet,
    birth_date: fechaNacimiento,
    facebook_link: linkFb || null,
    tiktok_link: linkTk || null,
    is_verified: 1
  };

  // 2. Log para ver el objeto completo antes de enviarlo a Supabase
  console.log("DEBUG: Datos que se enviarán a Supabase (upsert):", updateData);

  const { data, error: updateError } = await supabase
    .from('members')
    .upsert(updateData, { onConflict: 'id' })
    .select(); // Agregamos select para ver qué responde la DB

  if (updateError) {
    console.error('DEBUG: Error de Supabase:', updateError);
    setError('Error al guardar: ' + updateError.message);
  } else {
    // 3. Log para ver qué devolvió la base de datos tras la operación
    console.log("DEBUG: Respuesta exitosa de Supabase:", data);
    setStatus(1);
    onVerified(1);
  }
  setLoading(false);
};

  return (
    <IonModal isOpen={isOpen} backdropDismiss={false}>
      
      <IonContent className="ion-padding ion-text-center">

        {(status === 0 || status === 3) && (
          <>
            <div style={{ marginBottom: '20px', padding: '20px' }}>
              {status === 3 && (
                <IonIcon
                  icon={alertCircleOutline}
                  style={{ fontSize: '54px', color: 'red', marginBottom: '10px' }}
                />
              )}

              <h2 className="ys-text">
                {status === 3 ? 'Verificación Rechazada' : 'Hola, falta un paso'}
              </h2>
              <p>Proporciona tus datos para validar tu perfil.</p>
            </div>

            <IonList lines="none">

              {/* CARNET */}
              <IonItem style={styles.itemInput}>
                <div style={{ width: '100%', padding: '8px 0' }}>
                  <IonText>
                    Carnet de Identidad (C.I.)
                  </IonText>
                  <IonInput
                    type="text"
                    value={carnet}
                    onIonInput={(e) => setCarnet(e.detail.value)}
                    style={{ borderBottom: '1px solid #d1d1d6', fontSize: '26px', fontWeight: '600'}}
                  />
                </div>
              </IonItem>

              {/* FECHA */}
              <div style={styles.sidePaddingContainer}>
                <button
                  onClick={() => setShowDatePicker(true)}
                  style={styles.dateButton}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <IonIcon
                      icon={calendarOutline}
                      style={{ marginRight: '8px', color: '#666' }}
                    />
                    <span style={{ color: '#666' }}>
                      Fecha de Nacimiento:
                    </span>
                  </div>
                  <span style={{ fontWeight: 600, color: '#007aff' }}>
                    {fechaTexto}
                  </span>
                </button>
              </div>

              <div style={{ margin: '20px 0 10px 20px', textAlign: 'left' }}>
                <IonText color="medium">
                  Redes Sociales (Opcional)
                </IonText>
              </div>

              {/* FACEBOOK */}
              <IonItem style={styles.itemInput}>
                <IonIcon
                  icon={logoFacebook}
                  slot="start"
                  style={{ color: '#1877F2', marginTop: '16px', paddingRight: '12px' }}
                />
                <div style={{ width: '100%' }}>
                  <IonLabel position="stacked">
                    Link de Perfil Facebook
                  </IonLabel>
                  <IonInput
                    type="url"
                    value={linkFb}
                    onIonInput={(e) => setLinkFb(e.detail.value)}
                    style={{ borderBottom: '1px solid #d1d1d6' }}
                  />
                </div>
              </IonItem>

              {/* TIKTOK */}
              <IonItem style={styles.itemInput}>
                <IonIcon
                  icon={logoTiktok}
                  slot="start"
                  style={{ color: '#000', marginTop: '16px', paddingRight: '12px' }}
                />
                <div style={{ width: '100%' }}>
                  <IonLabel position="stacked">
                    Link de Perfil TikTok
                  </IonLabel>
                  <IonInput
                    type="url"
                    value={linkTk}
                    onIonInput={(e) => setLinkTk(e.detail.value)}
                    style={{ borderBottom: '1px solid #d1d1d6' }}
                  />
                </div>
              </IonItem>

            </IonList>

            {error && (
              <IonText color="danger">
                <p><small><strong>{error}</strong></small></p>
              </IonText>
            )}

            <div style={{ ...styles.sidePaddingContainer, marginTop: '30px' }}>
              <IonButton
                expand="block"
				color="success"
                onClick={handleGuardar}
                disabled={loading}
                style={{ height: '54px', '--border-radius': '12px', fontWeight:'600' }}
              >
                {loading ? <IonSpinner name="crescent" /> : 'ENVIAR DATOS'}
              </IonButton>
            </div>
          </>
        )}

        {status === 1 && (
          <div style={styles.centered}>
            <IonIcon icon={timeOutline} style={{ fontSize: '80px', color: 'orange' }} />
            <h2 className="ys-text" style={{ marginTop: '24px' }}>Solicitud en Revisión</h2>
            <p style={{ color: '#666', maxWidth: '250px' }}>
              Tus datos han sido enviados exitosamente.
            </p>
            <IonSpinner name="dots" style={{ marginTop: '20px' }} />
          </div>
        )}

        {/* DATE PICKER */}
        <IonModal
          isOpen={showDatePicker}
          onDidDismiss={() => setShowDatePicker(false)}
          initialBreakpoint={0.4}
          breakpoints={[0, 0.4, 0.6]}
        >
          <IonHeader>
            <IonToolbar>
              <IonTitle>Seleccionar Fecha</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowDatePicker(false)}>
                  Listo
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonDatetime
              presentation="date"
			  preferWheel={true}
              locale="es-ES"
			  size="cover"
              onIonChange={handleDateChange}
              value={fechaNacimiento || '2000-01-01'}
            />
          </IonContent>
        </IonModal>

      </IonContent>
    </IonModal>
  );
};

/* =======================
   ESTILOS
======================= */
const styles = {
  itemInput: {
    backgroundColor: '#f2f2f7',
    borderRadius: '12px',
    marginBottom: '10px',
    marginLeft: '16px',
    marginRight: '16px'
  },
  sidePaddingContainer: {
    paddingLeft: '16px',
    paddingRight: '16px',
    width: '100%'
  },
  dateButton: {
    width: '100%',
    padding: '16px',
    borderRadius: '12px',
    backgroundColor: '#f2f2f7',
    border: 'none',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  centered: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  }
};

export default VerificationModal;
