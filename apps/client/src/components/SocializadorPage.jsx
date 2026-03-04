import React, { useState, useEffect, useCallback } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton,
  IonButtons, IonGrid, IonRow, IonCol, IonIcon, IonModal, IonItem,
  IonLabel, IonInput, IonButton, IonToast, IonSpinner, IonText
} from '@ionic/react';
import { 
  personAddOutline, 
  checkmarkCircle, 
  timeOutline, 
  closeCircleOutline, 
  rocketOutline,
  megaphoneOutline 
} from 'ionicons/icons';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const SocializadorPage = () => {
  const [currentUser] = useState(() => {
    const saved = localStorage.getItem('user_session');
    return saved 
      ? JSON.parse(saved) 
      : { id: 'dcbc31f9-14e5-4757-8acf-7f5e11f7f797', tier: 1 };
  });

  const [voluntarios, setVoluntarios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showToast, setShowToast] = useState({ show: false, msg: '', color: 'success' });
  const [formData, setFormData] = useState({ name: '', phone: '' });

  const generateAccessCode = () => Math.floor(100000 + Math.random() * 900000).toString();

  // CARGAR DATOS FILTRADOS
  const loadVoluntarios = useCallback(async () => {
    setFetching(true);
    try {
      const res = await fetch(`${API_BASE_URL}/get-referidos?referrer_id=${currentUser.id}`);
      const result = await res.json();
      
      if (result.code === 0) {
        // DIFERENCIACIÓN: Solo cargamos los que NO están en la cuadrícula de Referidos (ID > 5)
        const soloSocializadoresExtra = result.data.filter(item => 
          item.member_type === 1 && item.id_slot > 5
        );
        setVoluntarios(soloSocializadoresExtra);
      }
    } catch (e) {
      console.error('Error al cargar socializadores');
    } finally {
      setFetching(false);
    }
  }, [currentUser.id]);

  useEffect(() => {
    loadVoluntarios();
  }, [loadVoluntarios]);

  // GUARDAR NUEVO VOLUNTARIO (ID_SLOT DINÁMICO > 5)
  const handleSave = async () => {
    if (!formData.name || !formData.phone) {
      setShowToast({ show: true, msg: 'Completa los campos', color: 'warning' });
      return;
    }

    const phoneRegex = /^[67]\d{7}$/;
    if (!phoneRegex.test(formData.phone)) {
      setShowToast({ show: true, msg: 'Celular inválido', color: 'warning' });
      return;
    }

    setLoading(true);
    const accessCode = generateAccessCode();
    
    // El nuevo id_slot será el total de extras + 6 (para no pisar los 5 iniciales)
    const nuevoIdSlot = voluntarios.length + 6;

    const payload = {
      name: formData.name,
      phone: formData.phone,
      identity_card: `SOC-${Date.now()}`,
      member_type: 1, 
      tier: (currentUser.tier || 1) + 1,
      is_verified: 0,
      referrer_id: currentUser.id,
      access_code: accessCode,
      id_slot: nuevoIdSlot
    };

    try {
      const response = await fetch(`${API_BASE_URL}/add-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();

      if (result.code === 0) {
        setShowToast({ show: true, msg: '¡Invitación enviada!', color: 'success' });
        setShowModal(false);
        loadVoluntarios();

        const mensaje = `¡Hola! 👋 Únete a mi equipo de socializadores.\nActiva tu cuenta aquí: https://pwa-xsch-client.vercel.app/\nTu código: *${accessCode}*`;
        window.location.assign(`https://wa.me/591${formData.phone}?text=${encodeURIComponent(mensaje)}`);
      } else {
        setShowToast({ show: true, msg: result.msg, color: 'danger' });
      }
    } catch (error) {
      setShowToast({ show: true, msg: 'Error de conexión', color: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': '#ffffff' }}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" text="Atrás" />
          </IonButtons>
          <IonTitle className="ys-text">Socializadores</IonTitle>
          {fetching && <IonSpinner slot="end" name="crescent" className="mr-4" />}
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding bg-slate-50">
        
        {/* Banner Superior */}
        <div className="p-6 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] shadow-xl mb-6 text-white relative overflow-hidden">
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1 opacity-80">
                    <IonIcon icon={rocketOutline} />
                    <span className="text-[10px] uppercase font-black tracking-widest">Plan de Expansión</span>
                </div>
                <h1 className="text-2xl font-bold leading-tight">Crea tu propia<br/>red de apoyo</h1>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
        </div>

        <div className="px-2 mb-4">
            <h2 className="ys-text-sm">Mis Socializadores Extra</h2>
        </div>

        <IonGrid className="ion-no-padding">
          <IonRow>
            {/* Lista dinámica de voluntarios extra */}
            {voluntarios.map((vol, i) => (
              <IonCol size="3" key={vol.id || i} className="p-[5px]">
                <div className={`relative flex flex-col items-center pt-5 pb-2 rounded-[1.2rem] border-[1.5px] shadow-sm 
                  ${vol.is_verified >= 2 ? 'bg-green-50 border-green-200 text-green-600' : 'bg-white border-indigo-100 text-indigo-400'}`}>
                  
                  <div className="absolute -top-1.5 right-1 bg-indigo-500 text-white text-[7px] px-1.5 py-0.5 rounded-full font-black uppercase">
                      T-{vol.tier}
                  </div>

                  <IonIcon 
                    icon={vol.is_verified >= 2 ? checkmarkCircle : vol.is_verified === 3 ? closeCircleOutline : timeOutline} 
                    className="text-2xl mb-1" 
                  />
                  
                  <span className="text-[8px] font-black uppercase tracking-tighter text-center px-1 truncate w-full">
                    {vol.name?.split(' ')[0] || 'Socio'}
                  </span>
                </div>
              </IonCol>
            ))}

            {/* Botón Añadir */}
            <IonCol size="3" className="p-[5px]">
              <div
                onClick={() => { setFormData({ name: '', phone: '' }); setShowModal(true); }}
                className="flex flex-col items-center justify-center pt-5 pb-2 rounded-[1.2rem] border-[1.5px] border-dashed border-indigo-300 bg-indigo-50/50 text-indigo-400 active:scale-90 transition-all"
                style={{ minHeight: '75px' }}
              >
                <IonIcon icon={personAddOutline} className="text-2xl mb-1" />
                <span className="text-[8px] font-black uppercase">Nuevo</span>
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Modal de Registro */}
        <IonModal
          isOpen={showModal}
          onDidDismiss={() => setShowModal(false)}
          initialBreakpoint={0.6}
          breakpoints={[0, 0.6, 0.8]}
        >
          <div className="ion-padding pt-8">
            <div className="text-center mb-6">
                <h2 className="text-xl font-bold ys-text">Invitar Socio</h2>
                <p className="text-xs text-slate-500">Agrega un voluntario tipo 1 fuera de tus slots principales</p>
            </div>

            <div className="space-y-4 px-2">
              <IonItem fill="outline" className="rounded-2xl">
                <IonLabel position="stacked">Nombre</IonLabel>
                <IonInput 
                    style={{ fontSize: '18px', fontWeight: '600' }} 
                    value={formData.name} 
                    onIonInput={e => setFormData({ ...formData, name: e.detail.value })} 
                />
              </IonItem>

              <IonItem fill="outline" className="rounded-2xl">
                <IonLabel position="stacked">WhatsApp</IonLabel>
                <IonInput 
                    type="tel" 
                    maxlength={8} 
                    style={{ fontSize: '18px', fontWeight: '600' }} 
                    value={formData.phone} 
                    onIonInput={e => setFormData({ ...formData, phone: e.detail.value })} 
                />
              </IonItem>

              <div className="pt-4">
                <IonButton
                    expand="block"
                    className="font-bold h-12"
                    style={{ '--border-radius': '14px', '--background': '#4f46e5' }}
                    onClick={handleSave}
                    disabled={loading}
                >
                    {loading ? <IonSpinner name="crescent" /> : 'Confirmar e Invitar'}
                </IonButton>
              </div>
            </div>
          </div>
        </IonModal>

        <IonToast
          isOpen={showToast.show}
          message={showToast.msg}
          color={showToast.color}
          duration={2500}
          onDidDismiss={() => setShowToast({ ...showToast, show: false })}
        />

      </IonContent>
    </IonPage>
  );
};

export default SocializadorPage;