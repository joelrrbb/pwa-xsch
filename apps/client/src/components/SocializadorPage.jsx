import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton,
  IonButtons, IonGrid, IonRow, IonCol, IonIcon, IonModal, IonItem,
  IonLabel, IonInput, IonButton, IonToast, IonSpinner
} from '@ionic/react';

import { 
  personAddOutline, 
  checkmarkCircle, 
  timeOutline, 
  closeCircleOutline, 
  rocketOutline 
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

  const [showToast, setShowToast] = useState({
    show: false,
    msg: '',
    color: 'success'
  });

  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });

  const generateAccessCode = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

  /*
  ============================
  FETCH OPTIMIZADO
  ============================
  */

  const loadVoluntarios = useCallback(async () => {

    const controller = new AbortController();

    try {

      setFetching(true);

      const res = await fetch(
        `${API_BASE_URL}/get-referidos?referrer_id=${currentUser.id}`,
        { signal: controller.signal }
      );

      const result = await res.json();

      if (result.code === 0) {

        const soloSocializadoresExtra = result.data.filter(
			item => item.member_type === 1 && item.id_slot > 5 && item.id_slot <= 10
		);

        setVoluntarios(soloSocializadoresExtra);
      }

    } catch (e) {

      if (e.name !== "AbortError") {
        console.error("Error cargando socializadores");
      }

    } finally {

      setFetching(false);

    }

    return () => controller.abort();

  }, [currentUser.id]);

  useEffect(() => {
    loadVoluntarios();
  }, [loadVoluntarios]);

  /*
  ============================
  SLOT CALCULATION MEMO
  ============================
  */

  const nextSlot = useMemo(() => {
  // Si ya tenemos 5 o más, no permitimos más slots
  if (voluntarios.length >= 5) return null;

  // Si no hay voluntarios, empezamos en el slot 6
  if (voluntarios.length === 0) return 6;

  // Calculamos el siguiente slot basándonos en el máximo actual
  const max = Math.max(...voluntarios.map(v => v.id_slot));
  return max + 1;
}, [voluntarios]);

  /*
  ============================
  SAVE OPTIMIZADO
  ============================
  */

  const handleSave = useCallback(async () => {

    if (!formData.name || !formData.phone) {

      setShowToast({
        show: true,
        msg: 'Completa los campos',
        color: 'warning'
      });

      return;
    }

    const phoneRegex = /^[67]\d{7}$/;

    if (!phoneRegex.test(formData.phone)) {

      setShowToast({
        show: true,
        msg: 'Celular inválido',
        color: 'warning'
      });

      return;
    }

    setLoading(true);

    const accessCode = generateAccessCode();

    const payload = {

      name: formData.name,

      phone: formData.phone,

      member_type: 1,

      tier: 1,

      is_verified: 0,

      referrer_id: currentUser.id,

      access_code: accessCode,

      id_slot: nextSlot

    };

    try {

      const response = await fetch(`${API_BASE_URL}/add-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.code === 0) {

        /*
        ============================
        OPTIMISTIC UI
        ============================
        */

        setVoluntarios(prev => [
          ...prev,
          {
            ...payload
          }
        ]);

        setShowToast({
          show: true,
          msg: '¡Invitación enviada!',
          color: 'success'
        });

        setShowModal(false);

        const mensaje =
          `¡Hola! 👋 Únete a mi equipo de socializadores.\n` +
          `Activa tu cuenta aquí: https://pwa-xsch-client.vercel.app/\n` +
          `Tu código: *${accessCode}*`;

        window.location.assign(
          `https://wa.me/591${formData.phone}?text=${encodeURIComponent(mensaje)}`
        );

      } else {

        setShowToast({
          show: true,
          msg: result.msg,
          color: 'danger'
        });

      }

    } catch {

      setShowToast({
        show: true,
        msg: 'Error de conexión',
        color: 'danger'
      });

    } finally {

      setLoading(false);

    }

  }, [formData, currentUser, nextSlot]);

  /*
  ============================
  RENDER
  ============================
  */

  return (
    <IonPage>

      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': '#ffffff' }}>

          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" text="Atrás" />
          </IonButtons>

          <IonTitle className="ys-text">Socializador</IonTitle>

          {fetching && (
            <IonSpinner
              slot="end"
              name="crescent"
              className="mr-4"
            />
          )}

        </IonToolbar>
      </IonHeader>

      <IonContent style={{
        '--padding-start': '15px',
        '--padding-end': '15px',
        '--padding-top': '15px'
      }}>

        <div className="p-6 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] shadow-xl mb-6 text-white relative overflow-hidden">

          <div className="relative z-10">

            <div className="flex items-center gap-2 mb-1 opacity-80">
              <IonIcon icon={rocketOutline}/>
              <span className="text-[10px] uppercase font-black tracking-widest">
                Plan de Expansión
              </span>
            </div>

            <h1 className="text-2xl font-bold leading-tight">
              Crea tu propia<br/>red de apoyo
            </h1>

          </div>

          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>

        </div>

        <div className="px-1 mb-4">
          <h2 className="ys-text-sm">Mi estructura</h2>
        </div>

        <IonGrid className="ion-no-padding">
          <IonRow>

            {voluntarios.map((vol, i) => (

              <IonCol size="3" key={vol.id_slot || i} className="p-[4px]">

                <div className={`relative flex flex-col items-center pt-5 pb-2 rounded-[1.2rem] border-[1.5px] shadow-sm 
                ${vol.is_verified >= 2
                  ? 'bg-green-50 border-green-200 text-green-600'
                  : 'bg-white border-indigo-100 text-indigo-400'}`}>

                  <div className="absolute -top-1.5 right-1 bg-indigo-500 text-white text-[7px] px-1.5 py-0.5 rounded-full font-black uppercase">
                    T-{vol.tier}
                  </div>

                  <IonIcon
                    icon={
                      vol.is_verified >= 2
                        ? checkmarkCircle
                        : vol.is_verified === 3
                        ? closeCircleOutline
                        : timeOutline
                    }
                    className="text-2xl mb-1"
                  />

                  <span className="text-[8px] font-black uppercase tracking-tighter text-center px-1 truncate w-full">
                    {vol.name?.split(' ')[0] || 'Socio'}
                  </span>

                </div>

              </IonCol>

            ))}

            {nextSlot !== null && (
  <IonCol size="3" className="p-[4px]">
    <div
      onClick={() => {
        setFormData({ name: '', phone: '' });
        setShowModal(true);
      }}
      className="flex flex-col items-center justify-center pt-5 pb-2 rounded-[1.2rem] border-[1.5px] border-dashed border-indigo-300 bg-indigo-50/50 text-indigo-400 active:scale-95 transition-all"
      style={{ minHeight: '75px' }}
    >
      <IonIcon icon={personAddOutline} className="text-2xl mb-1"/>
      <span className="text-[8px] font-black uppercase">Nuevo</span>
    </div>
  </IonCol>
)}

          </IonRow>
        </IonGrid>
		
		{voluntarios.length >= 5 && (
  <div className="mt-6 mx-4 p-5 bg-gradient-to-r from-emerald-500 to-green-600 rounded-3xl text-center shadow-lg text-white animate-fade-in">
    <IonIcon icon={checkmarkCircle} className="text-4xl mb-2" />
    <h3 className="text-lg font-bold">¡Red Completa!</h3>
    <p className="text-xs opacity-90 leading-tight mt-1">
      Has alcanzado los 10 espacios. ¡Felicidades, ya aseguraste todos tus beneficios! 🚀
    </p>
  </div>
)}

        <IonModal
          isOpen={showModal}
          onDidDismiss={() => setShowModal(false)}
          initialBreakpoint={0.55}
          breakpoints={[0,0.55]}
        >

          <div className="ion-padding pt-8">

            <div className="text-center mb-6">
              <h2 className="text-xl font-bold ys-text">Gana al invitar amig@s</h2>
              <p className="text-xs text-slate-500">
                ¡Invita a 5 amigos y asegura tu recompensa!
              </p>
            </div>

            <div className="space-y-4 px-2">

              <IonItem fill="outline" className="rounded-2xl">
                <IonLabel position="stacked">Nombre</IonLabel>
                <IonInput
				  style={{ fontSize: '26px', fontWeight: '600' }}
                  value={formData.name}
                  onIonInput={e =>
                    setFormData({ ...formData, name: e.detail.value })
                  }
                />
              </IonItem>

              <IonItem fill="outline" className="rounded-2xl">
                <IonLabel position="stacked">Celular</IonLabel>
                <IonInput
                  type="tel"
				  style={{ fontSize: '26px', fontWeight: '600' }}
                  maxlength={8}
                  value={formData.phone}
                  onIonInput={e =>
                    setFormData({ ...formData, phone: e.detail.value })
                  }
                />
              </IonItem>

              <IonButton
                expand="block"
                className="font-bold h-12"
                style={{
                  '--border-radius': '14px',
                  '--background': '#4f46e5'
                }}
                onClick={handleSave}
                disabled={loading}
              >

                {loading
                  ? <IonSpinner name="crescent"/>
                  : 'Confirmar e Invitar'
                }

              </IonButton>

            </div>

          </div>

        </IonModal>

        <IonToast
          isOpen={showToast.show}
          message={showToast.msg}
          color={showToast.color}
          duration={2500}
          onDidDismiss={() =>
            setShowToast({ ...showToast, show:false })
          }
        />

      </IonContent>

    </IonPage>
  );

};

export default SocializadorPage;