import React, { useEffect, useState } from 'react';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonButtons, IonBackButton, IonText, IonButton, IonIcon, 
  IonSpinner, IonGrid, IonRow, IonCol 
} from '@ionic/react';
import { downloadOutline, cloudDownloadOutline, fileTrayFullOutline } from 'ionicons/icons';
import { supabase } from '../supabaseClient';
import FooterInstitucional from './FooterInstitucional';

const DownloadsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDownloads();
  }, []);

  const fetchDownloads = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('downloads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error al obtener descargas:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (url, fileName) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName || 'Material_Chuquisaca.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      window.open(url, '_blank');
    }
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': '#ffffff', '--color': '#000000' }}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" text="Atrás" mode="ios" />
          </IonButtons>
          <IonTitle className="ys-text">Descargas</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent style={{ '--background': '#ffffff' }}>
        <div style={{ padding: '15px', background: '#ffffff', minHeight: '100%' }}>
          
          {/* Encabezado Estilo Institucional */}
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
              <IonIcon icon={fileTrayFullOutline} style={{ color: '#0052cc' }} />
              <IonText style={{ color: '#0052cc', fontSize: '0.75rem', fontWeight: '700' }}>
                Material Oficial de Campaña
              </IonText>
            </div>
            <h1 className="ys-text-sm" style={{margin: '0 0 4px 0' }}>
              Recursos Digitales
            </h1>
            <p style={{ color: '#555', fontSize: '1rem', lineHeight: '1.4' }}>
              Descarga y comparte el material oficial para fortalecer nuestra presencia.
            </p>
          </div>

          {/* Grid de Imágenes (2 por fila) */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
              <IonSpinner name="crescent" color="dark" />
            </div>
          ) : (
            <IonGrid className="ion-no-padding">
              <IonRow>
                {items.map((item) => (
                  <IonCol size="6" key={item.id} style={{ padding: '5px' }}>
                    <div style={{
                      background: '#ffffff',
                      borderRadius: '24px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                      border: '1px solid #f2f2f2',
                      padding: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center'
                    }}>
                      <div style={{
                        width: '100%',
                        height: '200px',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        marginBottom: '10px',
                        background: '#f9f9f9'
                      }}>
                        <img 
                          src={item.img_url} 
                          alt={item.name} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      </div>
                      
                      <IonText style={{ 
                        fontSize: '0.8rem', 
                        fontWeight: '800', 
                        color: '#1a1a1a',
                        textAlign: 'center',
                        display: 'block',
                        textTransform: 'uppercase',
                        height: '2.4em',
                        overflow: 'hidden'
                      }}>
                        {item.name}
                      </IonText>

                      <IonButton
                        fill="solid"
						color="success"
                        size="small"
                        onClick={() => handleDownload(item.img_url, item.name)}
                      >
                        Descargar
                      </IonButton>
                    </div>
                  </IonCol>
                ))}
              </IonRow>
            </IonGrid>
          )}

          {/* Estado vacío */}
          {!loading && items.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <IonText color="medium">Próximamente más materiales...</IonText>
            </div>
          )}

          <div style={{ height: '40px' }}></div>
          
          <FooterInstitucional />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default DownloadsPage;