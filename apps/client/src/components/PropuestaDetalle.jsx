import React, { useEffect, useState } from 'react';
import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonToolbar, 
  IonButtons, 
  IonBackButton, 
  IonSpinner, 
  IonImg, 
  IonFooter,
  IonButton,
  IonIcon,
  IonTitle,
  IonText
} from '@ionic/react';
import { useParams } from 'react-router-dom';
import { mapOutline} from 'ionicons/icons';
import { supabase } from '../supabaseClient';

const PropuestaDetalle = () => {
  const { id } = useParams();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const { data, error } = await supabase
          .from('planes')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setPlan(data);
      } catch (err) {
        console.error('Error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [id]);

 
  if (loading) {
    return (
      <IonPage>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <IonSpinner name="crescent" color="primary" />
        </div>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': '#ffffff', '--color': '#000000' }}>
          <IonButtons slot="start">		  
		  <IonBackButton defaultHref="/home" text="Atrás" mode="ios" />
          </IonButtons>
          <IonTitle className="ys-text">{plan?.title}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
	  
	  <div style={{ textAlign: 'center'}}>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: '#f0f7ff', 
              padding: '6px 12px', 
              borderRadius: '20px',
              marginBottom: '12px'
            }}>
              <IonIcon icon={mapOutline} style={{ color: '#0052cc' }} />
              <IonText style={{ color: '#0052cc', fontSize: '0.75rem', fontWeight: '700' }}>
				  {plan?.subHeader}
              </IonText>
            </div>
          </div>
		  
        <div>
          {/* Imagen de Detalle (url_image_plan) */}
          <img 
            src={plan?.url_image_plan} 
            alt={plan?.title}
            style={{ 
              width: '100%', 
              display: 'block'
            }} 
          />
          
        </div>
      </IonContent>
    </IonPage>
  );
};

export default PropuestaDetalle;