import React, { useState, useEffect } from 'react';
import { IonContent, IonPage, IonSpinner, IonButton, IonImg, IonText, IonRouterLink, IonAlert } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import VerificationModal from './VerificationModal';
import TaskList from '../components/TaskList';
import GeminiCommenter from '../components/GeminiCommenter';
import PointsDisplay from '../components/PointsDisplay';
import { supabase } from '../supabaseClient';
import EventSwiper from '../components/EventSwiper';
import PlanSwiper from '../components/PlanSwiper';
import FooterInstitucional from '../components/FooterInstitucional';
import QRAsistencia from '../components/QRAsistencia';
import ImgModal from '../components/ImgModal';
import { useOneTimeModal } from '../hooks/usePromoModal';

import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export default function HomePage() {
		
  /* 1. Inicialización Síncrona de Sesión */
  const [session, setSession] = useState(() => {
    const saved = localStorage.getItem('user_session');
    return saved ? JSON.parse(saved) : null;
  });

  /* 2. Inicialización Síncrona del Modal (Evita el parpadeo) */
  const [showModal, setShowModal] = useState(() => {
    const saved = localStorage.getItem('user_session');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.is_verified !== 2; // Si es 2, el modal nace en false
    }
    return false;
  });
  
  const [showShopPromo, closeShopPromo] = useOneTimeModal(
    'has_seen_shop_promo_v1', 
    session?.is_verified === 2 // Condición: solo si está verificado
  );
  
  
  const getMemberTypeName = (type) => {
  const types = {
    "1": 'Voluntario',
    "2": 'Militante',
    "3": 'Concejal',
    "4": 'Asambleísta'
  };
  // Usamos toString() por si el valor viene como número desde el JSON
  return types[type?.toString()] || 'Simpatizante';
};

  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  /* 3. Sincronización con Supabase */
  useEffect(() => {
    if (!session?.id) return;

    const syncFromSupabase = async () => {
      const { data, error } = await supabase
        .from('members')
        .select('is_verified, identity_card, birth_date, points, tier, member_type, manager_phone,name')
        .eq('id', session.id)
        .maybeSingle();

      if (!error && data) {
        const updated = { ...session, ...data };
        localStorage.setItem('user_session', JSON.stringify(updated));
        setSession(updated);
        setShowModal(data.is_verified !== 2);
      }
	  
	  const hasSeenWelcome = localStorage.getItem('has_seen_welcome_v1');
      
      if (Number(data.is_verified) === 2 && !hasSeenWelcome) {
        setShowAlert(true);
        localStorage.setItem('has_seen_welcome_v1', 'true');
      }
	 
    };
    syncFromSupabase();
  }, []);
  
  useEffect(() => {
    // Solo iniciar si terminó de cargar, está verificado y no hay alertas/modales activos
    if (!loading && session?.is_verified === 2 && !showModal && !showAlert) {
      
      const hasSeenTour = localStorage.getItem('has_seen_tour_v1');
      
      if (!hasSeenTour) {
        const driverObj = driver({
          showProgress: true,
          nextBtnText: 'Siguiente',
          prevBtnText: 'Atrás',
          doneBtnText: '¡Entendido!',
          steps: [
            
            { 
              element: '#activities-area', 
              popover: { title: 'Tareas y Actividades', description: '¡Este es el corazón de la app! Completa tareas diarias para sumar puntos y ayudar a la red.', side: "top", align: 'center' } 
            },
            
          ]
        });

        // Pequeño delay para asegurar que el DOM esté listo tras el loading
        setTimeout(() => {
          driverObj.drive();
          localStorage.setItem('has_seen_tour_v1', 'true');
        }, 800);
      }
    }
  }, [loading, session, showModal, showAlert]);
  

  const handleLogout = () => {
    localStorage.removeItem('user_session');
    window.location.reload();
  };

  const handleVerifiedSuccess = (newStatus = 1) => {
    const updated = { ...session, is_verified: newStatus };
    localStorage.setItem('user_session', JSON.stringify(updated));
    setSession(updated);
    setShowModal(newStatus !== 2);
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        {loading && (
          <div style={styles.loadingOverlay}>
            <IonSpinner name="crescent" />
          </div>
        )}

        <VerificationModal
          isOpen={showModal}
          onVerified={handleVerifiedSuccess}
          memberId={session?.id}
        />

        {!loading && session && (
          <>
            <div style={{ padding: '20px' }}>
			
			<IonImg 
				src="/xsch-home.svg" 
				style={{ 
					width: '185px', 
					objectFit: 'contain' // Mantiene la proporción sin deformar
						}} 
			/>
              
			  
			  
			  <div style={styles.profileCard}>
                {/* Fila Superior: Nombre y (QR + Puntos) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  
                  {/* Lado Izquierdo: Nombre y Tipo */}
                  <div style={{ flex: 1 }}>
                    <IonText color="dark">
                      <h2 style={{ margin: 0, fontWeight: '800', fontSize: '1.4rem', lineHeight: '1.2' }}>
                        {getMemberTypeName(session.member_type)}
                      </h2>
                    </IonText>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                      {session.name || 'Simpatizante'}
                    </div>
                  </div>

                  {/* Lado Derecho: Contenedor para QR y Puntos alineados */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <QRAsistencia userId={session.id} />
                    <PointsDisplay />
                  </div>
                </div>

                {/* Fila de Datos Rápidos */}
                <div style={styles.dataGrid}>
                  <div style={styles.dataItem}>
                    <span style={styles.dataLabel}>Celular</span>
                    <span style={styles.dataValue}>{session.phone || 'No registrado'}</span>
                  </div>
                  <div style={styles.dataItem}>
                    <span style={styles.dataLabel}>Estado</span>
                    <span style={{ 
                      ...styles.dataValue, 
                      color: session.is_verified === 2 ? '#2dd36f' : session.is_verified === 3 ? '#eb445a' : '#ffc409' 
                    }}>
                      {session.is_verified === 2 ? '● Verificado'
                        : session.is_verified === 1 ? '● En revisión'
                        : session.is_verified === 3 ? '● Rechazado'
                        : '● Pendiente'}
                    </span>
                  </div>
                </div>
              </div>

              
              {session.is_verified === 2 && (
			  <>
			  
  <div style={{ display: 'flex', gap: '10px', width: '100%'}}>
  
  {/* Imagen 1: Referidos */}
  <IonRouterLink 
    routerLink="/referidos" 
    routerDirection="forward" 
    style={{ flex: 1 }}
  >
    <img 
      src="https://res.cloudinary.com/dljymqntm/image/upload/v1770272579/b1_uqz9es.webp" 
      alt="Referidos"
      style={{ width: '100%', height: '90px', objectFit: 'cover', borderRadius: '18px', display: 'block' }}
    />
  </IonRouterLink>

  {/* Imagen 2: Donación */}
{Number(session.member_type) === 1 ? (
        <IonRouterLink
          routerLink="/support"
          routerDirection="forward"
          style={{ flex: 1 }}
        >
          <img
            src="https://res.cloudinary.com/dljymqntm/image/upload/v1771601626/colab_g1uoj1.webp"
            alt="Support"
            style={{ width: '100%', height: '90px', objectFit: 'cover', borderRadius: '18px', display: 'block' }}
          />
        </IonRouterLink>
      ) : (
        <IonRouterLink
          routerLink="/donation"
          routerDirection="forward"
          style={{ flex: 1 }}
        >
          <img
            src="https://res.cloudinary.com/dljymqntm/image/upload/v1770272578/b2_kv2uvm.webp"
            alt="Donar"
            style={{ width: '100%', height: '90px', objectFit: 'cover', borderRadius: '18px', display: 'block' }}
          />
        </IonRouterLink>
      )}
    </div>

    {/* Swiper Condicional: PlanSwiper para Voluntarios, EventSwiper para el resto */}
    {Number(session.member_type) === 1 ? (
      <PlanSwiper />
    ) : (
      <EventSwiper />
    )}
				 		  
					{/* ID para el Tour: Área de Actividades */}
                  <div id="activities-area" style={{ marginTop: '20px' }}>
                    <TaskList userId={session.id} />
                  </div>
    
						{/* Nuevo componente de Gemini */}
					<GeminiCommenter userId={session.id} />
					
					{/* Banner de la Tienda (Acceso a Shop) */}
				<IonRouterLink 
					routerLink="/shop" 
					routerDirection="forward" 
					style={{ textDecoration: 'none', display: 'block', marginTop: '20px' }}
				>
				<img 
					src="https://res.cloudinary.com/dljymqntm/image/upload/v1770766715/banner-shop_dchwya.jpg"
					alt="Tienda"
					style={{ 
					width: '100%', 
					height: '120px', 
					objectFit: 'cover', 
					borderRadius: '18px', 
					display: 'block',
					boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
					}} 
				/>
				</IonRouterLink>
				
				<ImgModal 
          isOpen={showShopPromo}
          onClose={closeShopPromo}
          imageSrc="https://image2.suning.cn//uimg/cms/img/175705936352970940.png?format=is"
          targetRoute="/shop"
        />


				</>
				
              )}
            </div>

           {/* <div style={{ padding: '0 20px', marginBottom: '30px' }}>
				<button onClick={handleLogout} style={styles.logoutBtn}>
				Cerrar sesión
				</button>
				</div> 
			*/}
						
			<IonAlert
  isOpen={showAlert}
  onDidDismiss={() => setShowAlert(false)}
  header="Bienvenido"
  message="¡Felicidades! Has ganado tus primeros 10 puntos por completar tu registro. Empieza a sumar puntos completando tareas y fortaleciendo nuestra red de simpatizantes."
  buttons={[
    {
      text: '¡VAMOS A GANAR!',
      role: 'confirm',
      cssClass: 'alert-button-confirm',
      handler: () => {
        console.log('Voluntario motivado');
      }
    }
  ]}
></IonAlert>

			<div className="mt-8 px-4">
</div>
			
			
			
			<FooterInstitucional />
			
          </>
        )}
      </IonContent>
    </IonPage>
  );
}

const styles = {
  loadingOverlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#fff',
    zIndex: 99
  },
  pointsBadge: {
    background: '#f0f0f0',
    padding: '8px 12px',
    borderRadius: '12px',
    fontWeight: 'bold',
    fontSize: '0.9rem'
  },
  logoutBtn: {
    width: '100%',
    padding: '14px',
    borderRadius: '10px',
    background: '#ff3b30',
    color: '#fff',
    border: 'none',
    fontWeight: '600'
  },
  profileCard: {
    background: '#ffffff',
    borderRadius: '20px',
    padding: '20px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
    border: '1px solid #f0f0f0',
    marginTop: '15px',
    marginBottom: '20px'
  },
  dataGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
    marginTop: '15px',
    paddingTop: '15px',
    borderTop: '1px solid #f5f5f5'
  },
  dataItem: {
    display: 'flex',
    flexDirection: 'column'
  },
  dataLabel: {
    fontSize: '0.7rem',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  dataValue: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#333',
    marginTop: '2px'
  }
};