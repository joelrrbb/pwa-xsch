import React, { useEffect, useState } from 'react';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonButtons, IonBackButton, IonText, IonButton, IonIcon, IonSpinner 
} from '@ionic/react';
import { downloadOutline, logoWhatsapp, shieldCheckmarkOutline, informationCircleOutline } from 'ionicons/icons';
import { supabase } from '../supabaseClient';
import FooterInstitucional from './FooterInstitucional';

const DonationPage = () => {
  const [qrImageUrl, setQrImageUrl] = useState('');
  const [whatsappDisplay, setWhatsappDisplay] = useState(''); // Número que viene de la DB
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getQrFromSupabase();
  }, []);

  const getQrFromSupabase = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('qr_link')
        .select('url_image, comprobante') // Traemos el número de la columna comprobante
        .order('id', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      if (data) {
        setQrImageUrl(data.url_image);
        setWhatsappDisplay(data.comprobante); // Guardamos el número (ej: 67621903)
      }
    } catch (error) {
      console.error('Error al obtener datos:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!qrImageUrl) return;
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'QR_Aporte_Voluntario.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      window.open(qrImageUrl, '_blank');
    }
  };

  const openWhatsapp = () => {
    if (!whatsappDisplay) return;
    const message = encodeURIComponent("Hola, adjunto el comprobante de mi aporte voluntario.");
    // Añadimos el 591 al número que viene de la DB
    window.open(`https://wa.me/591${whatsappDisplay}?text=${message}`, '_blank');
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': '#ffffff', '--color': '#000000' }}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" text="Atrás" mode="ios" />
          </IonButtons>
          <IonTitle className="ys-text">Aportes</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent style={{ '--background': '#ffffff' }}>
        <div style={{ padding: '24px', background: '#ffffff', minHeight: '100%' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: '#f0f7ff', 
              padding: '6px 12px', 
              borderRadius: '20px',
              marginBottom: '12px'
            }}>
              <IonIcon icon={shieldCheckmarkOutline} style={{ color: '#0052cc' }} />
              <IonText style={{ color: '#0052cc', fontSize: '0.75rem', fontWeight: '700' }}>
                Contribución transparente
              </IonText>
            </div>
            <h1 style={{ fontWeight: '850', fontSize: '1.8rem', color: '#1a1a1a', margin: '0 0 4px 0' }}>
				Valoramos tu apoyo
			</h1>
			<p style={{ color: '#555', fontSize: '1rem', lineHeight: '1.4' }}>
				Tu contribución es el respaldo más honesto que nuestro partido puede recibir.
			</p>
          </div>

          <div style={{
            background: '#ffffff',
            borderRadius: '32px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
            border: '1px solid #f2f2f2',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <div style={{ 
              width: '240px', 
              height: '240px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: '2px dashed #ddd',
              borderRadius: '20px',
              padding: '10px',
              marginBottom: '20px'
            }}>
              {loading ? (
                <IonSpinner name="crescent" color="dark" />
              ) : qrImageUrl ? (
                <img src={qrImageUrl} alt="QR" style={{ width: '100%', borderRadius: '12px' }} />
              ) : (
                <IonText color="medium">QR no disponible</IonText>
              )}
            </div>

            <IonButton
			  color="success"
              fill="solid"  
              expand="block"
              onClick={handleDownload}
              style={{ width: '100%', '--border-radius': '14px', height: '52px', fontWeight: '700' }}
            >
              <IonIcon slot="start" icon={downloadOutline} />
              DESCARGAR QR
            </IonButton>
          </div>

          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            background: '#f9f9f9', 
            padding: '16px', 
            borderRadius: '16px',
            marginBottom: '24px',
            border: '1px solid #eee'
          }}>
            <IonIcon icon={informationCircleOutline} style={{ fontSize: '50px', color: '#666' }} />
            <IonText style={{ fontSize: '0.85rem', color: '#555', textAlign: 'left' }}>
              <strong>Aviso Importante:</strong> Este es un aporte <strong>estrictamente voluntario</strong>. Al realizarlo, declaras que los fondos provienen de fuentes lícitas en apoyo a los ideales del partido.
            </IonText>
          </div>

          {/* Bloque de Comprobante con número de la DB */}
          <div style={{
            background: '#f1f3f5',
            borderRadius: '24px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                background: '#fff', 
                borderRadius: '50%', 
                padding: '8px', 
                boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                display: 'flex'
              }}>
                <IonIcon icon={logoWhatsapp} style={{ fontSize: '28px', color: '#25D366' }} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <IonText style={{ display: 'block', fontSize: '0.8rem', color: '#666' }}>Envía tu comprobante al</IonText>
                <IonText style={{ fontWeight: '800', fontSize: '1.1rem', color: '#000' }}>
                  {loading ? 'Cargando...' : `+591 ${whatsappDisplay}`}
                </IonText>
              </div>
            </div>
            
            <button 
              onClick={openWhatsapp}
              disabled={loading || !whatsappDisplay}
              style={{
                background: '#48dd55',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 20px',
                fontWeight: '900',
                fontSize: '0.85rem',
                color: '#000',
                boxShadow: '0 4px 12px rgba(191, 255, 0, 0.3)',
                cursor: 'pointer',
                opacity: (loading || !whatsappDisplay) ? 0.5 : 1
              }}
            >
              ENVIAR
            </button>
          </div>

          <div style={{ height: '40px' }}></div>
		 		
			<FooterInstitucional />

        </div>
      </IonContent>
    </IonPage>
  );
};

export default DonationPage;