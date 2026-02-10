import { useEffect, useRef, useState } from 'react';
import { IonContent, IonPage, IonSpinner } from '@ionic/react';
import { supabase } from '../supabaseClient';
import '@khmyznikov/pwa-install';

export default function LandingPage() {
  const pwaInstallRef = useRef(null);
  const [landingImg, setLandingImg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLandingImg = async () => {
      try {
        const { data } = await supabase.from('system_conf').select('landing_img_url').single();
        if (data?.landing_img_url) {
          const img = new Image();
          img.src = data.landing_img_url;
          img.onload = () => { setLandingImg(data.landing_img_url); setLoading(false); };
          img.onerror = () => setLoading(false);
        } else { setLoading(false); }
      } catch (err) { setLoading(false); }
    };
    fetchLandingImg();
	
	const handler = (e) => {
      console.log("Evento de instalación capturado");
    };
	window.addEventListener('beforeinstallprompt', handler);

    const timer = setTimeout(() => {
      if (pwaInstallRef.current) {
        console.log("Intentando mostrar diálogo...");
        pwaInstallRef.current.showDialog();
      }
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(timer);
    };
  }, []);

  return (
    <IonPage>
      <IonContent fullscreen scrollY={false}>
        
        {/* CARGA INICIAL */}
        {loading && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 10, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
            <IonSpinner name="crescent" color="primary" />
          </div>
        )}

        {/* CONTENEDOR PRINCIPAL */}
        <div style={{
          height: '100vh', 
          width: '100vw', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          backgroundColor: '#fff',
          backgroundImage: landingImg ? `url(${landingImg})` : 'none',
          backgroundSize: 'cover', 
          backgroundPosition: 'center', 
          position: 'relative',
          opacity: loading ? 0 : 1, 
          transition: 'opacity 0.3s ease-in'
        }}>
          
          {/* ESPACIADOR SUPERIOR: Este empuja el botón hacia abajo */}
          <div style={{ flex: 3 }} /> 

          {/* EL BOTÓN (DISEÑO EPIC GAMES) */}
          {!loading && (
            <div style={{ 
              width: '100%', 
              padding: '0 25px', 
              boxSizing: 'border-box', 
              maxWidth: '450px',
              zIndex: 2
            }}>
              <button 
                onClick={() => pwaInstallRef.current?.showDialog()}
                style={{
                  width: '100%',
                  backgroundColor: '#f7ff19',
                  borderRadius: '1rem',
                  border: 'none',
                  color: '#000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem 0.8rem 1rem 1.3rem',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
                  <span style={{ fontSize: '0.625rem', fontWeight: 'bold', textTransform: 'uppercase', opacity: 0.7, letterSpacing: '0.5px' }}>
                    Disponible para tu dispositivo
                  </span>
                  <span style={{ fontSize: '1.1rem', fontWeight: '900', lineHeight: '1', marginTop: '4px' }}>
                    DESCARGAR AHORA
                  </span>
                </div>

                <div style={{ width: '36px', height: '36px', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                  <svg
  viewBox="0 0 24 24"
  style={{ 
    width: '44px', 
    height: '44px', 
    enableBackground: 'new 0 0 24 24' 
  }}
>

  <path
    style={{ 
      fillRule: 'evenodd', 
      clipRule: 'evenodd', 
      fill: 'currentColor' 
    }}
    d="M24,5.5c0-0.5-0.1-1.2-0.1-1.5c-0.1-0.5-0.2-0.9-0.4-1.3c-0.4-0.9-1.2-1.6-2-2c-0.4-0.2-0.8-0.4-1.3-0.4
    c-0.3-0.1-1-0.1-1.5-0.1c-0.2,0-0.5,0-0.6,0H6.1C6,0,5.7,0,5.5,0C4.9,0,4.2,0.1,3.9,0.1C3.5,0.2,3,0.4,2.6,0.6C1.7,1,1,1.7,0.6,2.6
    C0.4,3,0.2,3.5,0.1,3.9C0.1,4.2,0,4.9,0,5.5C0,5.7,0,6,0,6.1v11.8c0,0.1,0,0.4,0,0.6c0,0.5,0.1,1.2,0.1,1.5c0.1,0.5,0.2,0.9,0.4,1.3
    c0.4,0.9,1.2,1.6,2,2c0.4,0.2,0.8,0.3,1.3,0.4c0.3,0.1,1,0.1,1.6,0.1c0.2,0,0.5,0,0.6,0h11.8c0.1,0,0.4,0,0.6,0
    c0.5,0,1.2-0.1,1.5-0.1c0.5-0.1,0.9-0.2,1.3-0.4c0.9-0.4,1.6-1.2,2-2c0.2-0.4,0.4-0.8,0.4-1.3c0.1-0.3,0.1-1,0.1-1.6
    c0-0.2,0-0.5,0-0.6V6.1C24,6,24,5.7,24,5.5z M8.3,20.7l-0.4-1.2c-0.1-0.3-0.1-0.5-0.1-0.6c0,0.1-0.1,0.3-0.2,0.6l-0.4,1.2H6.1
    L7,18.1l-0.8-2.3h1.1l0.3,0.9c0.1,0.3,0.1,0.5,0.1,0.6c0-0.1,0.1-0.3,0.1-0.6l0.3-0.9h1.1l-0.8,2.3l0.9,2.5H8.3z M10.4,17.3
    c0.1,0.1,0.2,0.2,0.3,0.4l0.3,0.3c0.3,0.3,0.5,0.5,0.6,0.7c0.1,0.2,0.2,0.5,0.2,0.8c0,0.3-0.1,0.5-0.2,0.7c-0.1,0.2-0.3,0.4-0.5,0.5
    c-0.2,0.1-0.4,0.2-0.7,0.2c-0.3,0-0.6-0.1-0.8-0.3c-0.2-0.2-0.4-0.5-0.6-0.9l0.9-0.4c0.1,0.3,0.2,0.5,0.3,0.6
    c0.1,0.1,0.2,0.2,0.3,0.2c0.1,0,0.1,0,0.2-0.1s0.1-0.2,0.1-0.3c0-0.1,0-0.2-0.1-0.4c-0.1-0.1-0.2-0.2-0.3-0.4l-0.3-0.3
    C10,18.3,9.8,18.2,9.7,18c-0.1-0.1-0.2-0.3-0.3-0.4c-0.1-0.2-0.1-0.3-0.1-0.5c0-0.2,0.1-0.5,0.2-0.7c0.1-0.2,0.2-0.4,0.4-0.5
    c0.2-0.1,0.4-0.2,0.7-0.2c0.3,0,0.6,0.1,0.8,0.3c0.2,0.2,0.4,0.5,0.5,0.8l-0.8,0.4c-0.1-0.2-0.2-0.4-0.3-0.5
    c-0.1-0.1-0.2-0.2-0.3-0.2c-0.1,0-0.1,0-0.2,0.1c0,0.1-0.1,0.1-0.1,0.2C10.3,17.1,10.3,17.2,10.4,17.3z M13.1,19.2
    c0,0.2,0.1,0.4,0.1,0.5c0.1,0.1,0.1,0.2,0.3,0.2c0.1,0,0.2,0,0.2-0.1c0.1-0.1,0.1-0.3,0.2-0.5l0.9,0.4c-0.2,0.8-0.7,1.2-1.4,1.2
    c-0.5,0-0.9-0.2-1.1-0.6c-0.3-0.4-0.4-1-0.4-1.8c0-0.8,0.1-1.4,0.4-1.8s0.6-0.6,1.1-0.6c0.7,0,1.1,0.4,1.4,1.2L14,17.3
    c-0.1-0.3-0.2-0.5-0.2-0.6c-0.1-0.1-0.1-0.1-0.2-0.1c-0.1,0-0.2,0.1-0.3,0.2c-0.1,0.1-0.1,0.3-0.1,0.5c0,0.2,0,0.6,0,1
    S13.1,19,13.1,19.2z M17.9,20.7h-1.1v-2.1h-0.7v2.1H15v-4.8h1.1v1.8h0.7v-1.8h1.1V20.7z M18.7,11.6c0,0.2-0.1,0.3-0.4,0.3
    c-1.8,0-3.6,0-5.3,0c-0.2,0-0.3-0.1-0.5-0.2c0,0-0.1,0-0.1-0.1c0,0.1,0,0.1,0,0.2c0,0,0,0,0,0c-0.1,0.2-0.1,0.5-0.2,0.6
    c-0.2,0.1-0.5,0.1-0.8-0.1c-0.1,0-0.2,0-0.3-0.1c-0.1,0-0.2-0.1-0.2-0.2c-0.1-0.1-0.2-0.2-0.3-0.4c0,0.2-0.1,0.2-0.1,0.3
    c-0.1,0.3-0.3,0.4-0.6,0.2c-0.1-0.1-0.3-0.1-0.4-0.2c-0.1-0.1-0.3-0.1-0.4-0.2C9,12,9,12.2,9,12.3c-0.1,0.4-0.1,0.8-0.2,1.2
    c0,0.2-0.1,0.2-0.3,0.1c-0.1,0-0.1-0.1-0.2-0.1c-0.6-0.4-0.6-0.9-0.5-1.6c0-0.1,0.1-0.2,0.1-0.3c0-0.4,0.2-0.8,0.4-1.2
    c0.1-0.2,0.1-0.3,0-0.5C8.3,9.8,8.3,9.6,8.2,9.5C8.1,9.2,8.1,9,8.2,8.8c0,0,0-0.1,0-0.1c0-0.2,0-0.4,0.2-0.4c0.2,0,0.3-0.1,0.5-0.2
    c0.5-0.1,0.9-0.4,1.1-0.7C10,7.1,9.9,6.8,9.9,6.6C9.8,6.3,9.8,6.2,9.5,6.3C9,6.4,8.5,6.2,8.2,5.9C8,5.7,7.8,5.4,7.7,5.1
    C7.6,4.9,7.7,4.6,7.7,4.4c0-0.1-0.1-0.2-0.1-0.4c0,0-0.1,0-0.2,0C7.4,4,7.3,4,7.2,4c0,0,0-0.1,0-0.2c0.1-0.2,0.1-0.7-0.1-0.9
    C7.1,2.8,7.1,2.7,7.1,2.6c0-0.1,0.2-0.1,0.3-0.1c0.2,0,0.5,0,0.7,0.1C8.5,2.8,8.7,3,8.8,3.4c0.1,0,0.3,0,0.4,0
    C9.3,3.3,9.4,3.2,9.6,3c0.2-0.2,0.5-0.1,0.7,0c0.3,0,0.4,0.2,0.6,0.4c0.1,0.1,0.3,0.1,0.4,0c0.4-0.2,0.5-0.1,0.7,0.3
    C12,4,12.2,4.3,12.4,4.6c0,0,0,0.1,0.1,0.1c0.3,0.1,0.4,0.3,0.4,0.5c0,0,0,0.1,0.1,0.2c0-0.1,0-0.1,0.1-0.1c0-0.1,0.1-0.4,0.1-0.4
    c0.2,0,0.4,0,0.6,0c0,0,0.1,0.1,0.1,0.2c0.1,1.2,0.1,2.4,0.2,3.6C14,9,14,9.4,14,9.7c0.3,0.1,0.5-0.1,0.7-0.2
    c0.2-0.1,0.4-0.1,0.4,0.1c0,0.2,0.1,0.2,0.2,0.2c1.1,0,2.1,0,3.2,0c0.1,0,0.2,0,0.3,0C18.6,10.5,18.7,11.1,18.7,11.6z"
  />
</svg>
                </div>
              </button>
			  
			  
			  
			  
			  <div style={{
        marginTop: '20px', // Espacio exacto entre botón y texto
        color: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        cursor: 'pointer',
        width: '100%' // Asegura que el contenedor del texto use todo el ancho para centrar
      }}>
        <span style={{ 
          textTransform: 'uppercase', 
          fontWeight: '800', 
          fontSize: '0.85rem', 
          letterSpacing: '1px' 
        }}>
          Juntos somos más fuertes
        </span>
        <svg 
          viewBox="0 0 24 24" 
          style={{ width: '18px', height: '18px', fill: 'currentColor' }}
        >
          <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
        </svg>
      </div>
	  
	  
	  
    
            </div>
          )}

          {/* ESPACIADOR INFERIOR: Da el margen final con el suelo */}
          <div style={{ flex: 1.2 }} /> 

          <pwa-install 
			ref={pwaInstallRef} 
			name="POR SIEMPRE CHUQUISACA" 
			icon="/xsch-1.svg" 
			use-custom="true" 
			>
			</pwa-install>	
        </div>
      </IonContent>
    </IonPage>
  );
}