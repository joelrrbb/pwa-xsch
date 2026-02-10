import React, { useState, useRef } from 'react';
import { 
  IonPage, IonContent, IonIcon, IonItem, IonLabel, IonInput, IonInputOtp,
  IonText, IonList, IonSpinner, IonButton
} from '@ionic/react';
import { notificationsOutline } from 'ionicons/icons';

// Importamos la instancia única que creamos en el otro archivo
import { supabase } from '../supabaseClient';
import OneSignal from 'react-onesignal';

const LoginPage = ({ onLogin }) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const otpRef = useRef(null);

  const handlePhoneInput = (e) => {
    const val = e.detail.value || '';
    const onlyNums = val.replace(/[^0-9]/g, '').slice(0, 8);
    setPhone(onlyNums);
  };

  const handleLogin = async () => {
	  
	  try {
		const permission = OneSignal.Notifications.requestPermission();
      
      if (permission !== 'granted') {
        throw new Error('Es necesario aceptar las notificaciones para iniciar sesión.');
      }
  } catch (e) {
    console.log('Permiso de notificaciones no concedido');
  }
  
  
    const code = otpRef.current?.value;
    
    if (phone.length !== 8 || !code || code.length < 6) {
      setError('Ingresa un teléfono válido y el código de 6 dígitos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Formateamos el identificador (asumiendo que usas email/pass como bypass)
      const email = `${phone}@app.com`;

      // Autenticación usando la instancia centralizada
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: code,
      });

      if (signInError) throw signInError;
      if (!data.user) throw new Error('Usuario no encontrado');

      // Nota: Supabase guarda la sesión automáticamente en el LocalStorage.
      // Guardamos este objeto extra solo si tu lógica de negocio lo requiere.
      localStorage.setItem('user_session', JSON.stringify({
        id: data.user.id,
        phone,
      }));
	  
	  console.log("1. Objeto 'user' completo de Supabase:", data.user);
    console.log("2. ID (UUID) que asignó Supabase Auth:", data.user.id);

      // Notificar a la app que el login fue exitoso
      onLogin();

    } catch (err) {
      console.error('Login Error:', err);
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          height: '100%', 
          maxWidth: '350px', 
          margin: '0 auto' 
        }}>
          
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
			<h1 className='ys-text' style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
				Acceso
			</h1>
  
  {/* Contenedor de la imagen centrada */}
	<div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    marginTop: '10px' 
  }}>
    <img 
      src="/xsch-login.svg" 
      alt="Logo"
      style={{ 
        width: '80px',  // Ajusta el ancho según necesites
        height: 'auto',
        display: 'block'
      }} 
    />
  </div>
</div>

          <IonList lines="none" style={{ background: 'transparent' }}>
            <IonItem style={{ 
              backgroundColor: '#f2f2f7', 
              borderRadius: '12px', 
              marginBottom: '25px',
              '--inner-padding-end': '0px'
            }}>
              <div style={{ width: '100%'}}>
                <IonLabel position="stacked" style={{ color: '#666', marginBottom: '5px', fontSize:'18px' }}>
                  Número de teléfono
                </IonLabel>
                <IonInput
                  type="tel" 
                  value={phone}
				  placeholder='67621903'
                  onIonInput={handlePhoneInput}
                  maxlength={8}
                  style={{ fontSize: '26px', fontWeight: '500', borderBottom: '1px solid #d1d1d6' }}
                />
              </div>
            </IonItem>
			
			<div style={{ padding: '0 .9rem' }}>

            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <IonText className="ys-text">
                Código de 6 dígitos
              </IonText>
              <IonInputOtp
			    color="success"
                ref={otpRef} 
                length={6} 
                style={{ fontSize: '26px', fontWeight: '500' }} 
              />
            </div>
          </IonList>

          <div style={{ 
			backgroundColor: '#fff4e6', // Naranja extremadamente claro (fondo)
			border: '1px solid #ff922b', // Borde naranja vibrante
			padding: '12px', 
			borderRadius: '10px',
			display: 'flex',
			alignItems: 'center',
			gap: '10px',
			marginBottom: '15px'
		}}>
			<IonIcon icon={notificationsOutline} style={{ color: '#fd7e14', fontSize: '20px' }} />
			<IonText style={{ color: '#d9480f', fontSize: '13px', fontWeight: '600', lineHeight: '1.2' }}>
				Toca en "Permitir" para completar el proceso.
			</IonText>
		</div>

          {error && (
            <IonText color="danger" style={{ textAlign: 'center', marginBottom: '15px', display: 'block' }}>
              <small style={{ fontWeight: '600' }}>{error}</small>
            </IonText>
          )}

          <div style={{ marginTop: '10px' }}>
            <IonButton
              onClick={handleLogin}
              disabled={loading}
			  color="success"
              style={{
                width: '100%',
				height: '60px',          
                borderRadius: '14px',
                fontWeight: '600',
                fontSize: '20px',
                border: 'none',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '58px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {!loading ? 'Ingresar' : <IonSpinner name="crescent" color="light" />}
            </IonButton>
          </div>
		  
		  </div>
		  
        </div>
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;