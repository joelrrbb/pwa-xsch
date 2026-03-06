import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton,
  IonButtons, IonGrid, IonRow, IonCol, IonIcon, IonModal, IonItem,
  IonLabel, IonInput, IonButton, IonText, IonToast, IonSpinner, IonDatetime
} from '@ionic/react';

import MembersProgressBar from '../components/MembersProgressBar';
import { checkmarkCircle, timeOutline, personAddOutline, closeCircleOutline } from 'ionicons/icons';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const GET_USER_CONFIG = (user) => {

  if (!user) return [];

  if (user.member_type === 1) {

    return [
      { id_slot: 1, member_type: 0, tier: null },
      { id_slot: 2, member_type: 0, tier: null },
      { id_slot: 3, member_type: 0, tier: null },
      { id_slot: 4, member_type: 1, tier: (user.tier || 1) + 1 },
      { id_slot: 5, member_type: 1, tier: (user.tier || 1) + 1 }
    ];

  }

  if (user.member_type === 2) {

    return Array.from({ length: 10 }, (_, i) => ({
      id_slot: i + 1,
      member_type: 0,
      tier: null
    }));

  }

  return Array.from({ length: 20 }, (_, i) => ({
    id_slot: i + 1,
    member_type: 0,
    tier: null
  }));

};

const ReferidosPage = () => {

  const [currentUser] = useState(() => {

    const saved = localStorage.getItem('user_session');

    return saved
      ? JSON.parse(saved)
      : { id: 'dcbc31f9-14e5-4757-8acf-7f5e11f7f797', phone: '700000', tier: 1, member_type: 1 };

  });

  const [referidosDB, setReferidosDB] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [showToast, setShowToast] = useState({
    show: false,
    msg: '',
    color: 'success'
  });

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    ci: '',
    fechaNac: ''
  });

  const generateAccessCode = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

  const [countdown, setCountdown] = useState({
    active: true,
    display: ""
  });

  const slotsConfig = useMemo(() =>
    GET_USER_CONFIG(currentUser)
  , [currentUser]);

  const referidosMap = useMemo(() => {

    const map = {};
    referidosDB.forEach(r => map[r.id_slot] = r);
    return map;

  }, [referidosDB]);

  const loadData = useCallback(async () => {

    const controller = new AbortController();

    try {

      setFetching(true);

      const res = await fetch(
        `${API_BASE_URL}/get-referidos?referrer_id=${currentUser.id}`,
        { signal: controller.signal }
      );

      const result = await res.json();

      if (result.code === 0) {
        setReferidosDB(result.data);
      }

    } catch (e) {

      if (e.name !== 'AbortError') {
        console.error('Error cargando referidos');
      }

    } finally {

      setFetching(false);

    }

    return () => controller.abort();

  }, [currentUser.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {

    if (!currentUser?.created_at || currentUser?.member_type !== 1) return;

    const baseDate = new Date(currentUser.created_at.replace(" ", "T"));
    const targetDate = new Date(baseDate);

    targetDate.setTime(baseDate.getTime() + (2 * 86400000) + (12 * 3600000));

    const updateTimer = () => {

      const diff = targetDate - Date.now();

      if (diff <= 0) {

        setCountdown({
          active: false,
          display: "Tiempo agotado"
        });

        return;

      }

      const d = Math.floor(diff / 86400000);

      const h = Math.floor((diff % 86400000) / 3600000)
        .toString()
        .padStart(2, '0');

      const m = Math.floor((diff % 3600000) / 60000)
        .toString()
        .padStart(2, '0');

      const s = Math.floor((diff % 60000) / 1000)
        .toString()
        .padStart(2, '0');

      setCountdown({
        active: true,
        display: `${d} días ${h}:${m}:${s}`
      });

    };

    updateTimer();

    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);

  }, [currentUser?.created_at, currentUser?.member_type]);

  const openSlot = useCallback((config, existingData) => {

    if (existingData) return;

    setSelectedSlot(config);

    setFormData({
      name: '',
      phone: '',
      ci: '',
      fechaNac: ''
    });

    setShowModal(true);

  }, []);

  const handleDateChange = useCallback((e) => {

    const value = e.detail.value;

    const formattedDate = value
      ? value.split('T')[0]
      : '';

    setFormData(prev => ({
      ...prev,
      fechaNac: formattedDate
    }));

  }, []);

  const handleSave = useCallback(async () => {

  const isVoluntary = selectedSlot.member_type === 1;

  if (isVoluntary) {

    if (!formData.phone || !formData.name) {
      alert('Nombre y Celular requeridos');
      return;
    }

    const phoneRegex = /^[67]\d{7}$/;

    if (!phoneRegex.test(formData.phone)) {
      setShowToast({
        show: true,
        msg: 'Formato de celular incorrecto.',
        color: 'warning'
      });
      return;
    }

  }

  if (!isVoluntary && !formData.ci) {
    alert('CI requerido');
    return;
  }

  setLoading(true);

  const accessCode = isVoluntary
    ? generateAccessCode()
    : null;

  const payload = {

    name: isVoluntary ? formData.name : 'Invitado',

    phone: isVoluntary
      ? formData.phone
      : Math.floor(1000000 + Math.random() * 9000000).toString(),

    identity_card: formData.ci,

    birth_date: formData.fechaNac || null,

    member_type: Number(selectedSlot.member_type),

    tier: isVoluntary
      ? Number(selectedSlot.tier)
      : null,

    is_verified: isVoluntary ? 0 : 1,

    referrer_id: currentUser.id,

    access_code: accessCode,

    id_slot: selectedSlot.id_slot

  };

  try {

    const response = await fetch(`${API_BASE_URL}/add-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.code === 0) {

      setShowToast({
        show: true,
        msg: '¡Registro exitoso!',
        color: 'success'
      });

      setShowModal(false);

      // 🔥 OPTIMISTIC UI
      setReferidosDB(prev => [
        ...prev,
        {
          id_slot: selectedSlot.id_slot,
          name: payload.name,
          member_type: payload.member_type,
          tier: payload.tier,
          is_verified: payload.is_verified
        }
      ]);

      if (isVoluntary) {

        const mensaje =
          `¡Hola! 👋 Ingresa aquí para activar tu cuenta:\n` +
          `https://pwa-xsch-client.vercel.app/\n\n` +
          `Tu código es: *${accessCode}*`;

        const encodedMsg = encodeURIComponent(mensaje);

        const whatsappUrl =
          `https://wa.me/591${formData.phone}?text=${encodedMsg}`;

        window.location.assign(whatsappUrl);

      }

    } else {

      setShowToast({
        show: true,
        msg: result.msg,
        color: 'danger'
      });

    }

  } catch (error) {

    setShowToast({
      show: true,
      msg: 'Error de conexión',
      color: 'danger'
    });

  } finally {

    setLoading(false);

  }

}, [formData, selectedSlot, currentUser]);

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': '#ffffff', '--color': '#000000' }}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" text="Atrás" />
          </IonButtons>
          <IonTitle className="ys-text">Mis Referidos</IonTitle>
          {fetching && <IonSpinner slot="end" name="crescent" className="mr-4" />}
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding bg-slate-50">
	 
	  
       <div className="p-3 bg-white rounded-[2.5rem] shadow-[0_15px_40px_rgba(34,197,94,0.08)] border border-green-50">
		<div className="mb-4 px-3">
			<IonText className="text-[11px] uppercase font-black text-slate-400 tracking-[0.15em] block mb-1">
			Crecimiento de Equipo
			</IonText>
			<h2 className="ys-text-sm" >
			Comunidad <span className="text-green-500">Activa</span>
			</h2>
			</div>

			<MembersProgressBar 
				current={currentUser?.referrals?.length || 12} 
				target={50} />
		</div>
		
		<div className="flex items-center gap-3 px-6">
			<h2 className="ys-text-sm">Compañeros de equipo</h2>	
		</div>
		
		
		
		
		{/* SECCIÓN DEL COUNTDOWN - SOLO PARA MEMBER_TYPE 1 */}
{currentUser?.member_type === 1 && (
  <div className="px-3 mt-2 mb-6">
    {countdown.active ? (
      /* ESTADO: ACTIVO (INCENTIVO DE PUNTOS) */
      <div className="relative overflow-hidden rounded-2xl shadow-lg flex items-center justify-between" 
           style={{ background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)', minHeight: '60px' }}>
        
        <div className="pl-5 flex flex-col justify-center">
          
          <span className="text-white text-base leading-tight">
            Gana <span className="text-yellow-300">100 puntos</span> <br/>
            invitando a 2 amigos
          </span>
        </div>

        <div className="pr-5 flex flex-col items-end justify-center">
          <div className="flex items-center gap-1 text-white/90 text-[10px] font-bold mb-1 uppercase tracking-tighter">
            <IonIcon icon={timeOutline} />
            <span>Expira en</span>
          </div>
          <div className="text-white font-mono text-base font-black leading-none tracking-tighter">
            {countdown.display}
          </div>
        </div>
        
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
      </div>
    ) : (
      /* ESTADO: EXPIRADO (AÚN PUEDE INSCRIBIR) */
      <div className="relative overflow-hidden rounded-2xl shadow-lg flex items-center justify-between" 
           style={{ background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)', minHeight: '60px' }}>
        
        <div className="pl-5 flex flex-col justify-center">
          <span className="text-white text-[10px] uppercase font-black tracking-[0.15em] opacity-80">
            El próximo puedes ser tú
          </span>
          <span className="text-white text-base leading-tight">
            ¡Estás a tiempo de cambiar tu futuro!
          </span>
        </div>

        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
      </div>
    )}
  </div>
)}

		
       <div className="px-3 mt-4"> {/* Contenedor con margen lateral para que no toque los bordes */}
  <IonGrid className="ion-no-padding">
    <IonRow>
      {slotsConfig.map((config, i) => {
        const isVoluntario = config.member_type === 1;
        const data = referidosMap[config.id_slot];
        const isRejected = data?.is_verified === 3;
        const isConfirmed = data?.is_verified >= 2;
        const isPending = data && data.is_verified < 2;
		const isEmptyVoluntario = isVoluntario && !data;

        // Lógica de estilos
        let cardStyle = "bg-gray-50 border-gray-300 text-gray-400";
        let icon = personAddOutline;
        let badgeColor = "bg-gray-400";
        
        if (isRejected) {
          cardStyle = "bg-red-50 border-red-200 text-red-500 shadow-sm";
          icon = closeCircleOutline;
          badgeColor = "bg-red-500";
        } else if (isConfirmed) {
          cardStyle = "bg-green-50 border-green-200 text-green-600 shadow-sm";
          icon = checkmarkCircle;
          badgeColor = "bg-green-500";
        } else if (isPending) {
          cardStyle = "bg-amber-50 border-amber-200 text-amber-600 shadow-sm";
          icon = timeOutline;
          badgeColor = "bg-amber-500";
        } else if (isVoluntario) {
          cardStyle = "bg-orange-50 border-orange-200 border-dashed text-orange-400";
          badgeColor = "bg-orange-500";
        }

        return (
          <IonCol size="3" key={i} className="p-[5px]"> {/* Espaciado interno entre slots */}
            <div
              onClick={() => openSlot(config, data)}
              className={`relative flex flex-col items-center pt-5 pb-2 rounded-[1.2rem] border-[1.5px] transition-all active:scale-90 ${cardStyle} ${isEmptyVoluntario ? 'animate-pulse-vibrate' : ''}`}
            >
              {/* Badge superior reducido */}
              <div className={`absolute -top-1.5 right-1 ${badgeColor} text-white text-[7px] px-1.5 py-0.5 rounded-full font-black shadow-sm uppercase tracking-tighter`}>
                {isVoluntario ? `T-${config.tier}` : 'Ref'}
              </div>

              {/* Icono central */}
              <div className="mb-1">
                <IonIcon icon={icon} className="text-2xl" />
              </div>

              {/* Nombre / Estado */}
              <span className="text-[8px] font-black uppercase tracking-tighter text-center px-1 truncate w-full leading-tight">
                {isRejected ? 'Rechazado' : 
                 isConfirmed ? (data?.name?.split(' ')[0] || 'OK') : 
                 isPending ? 'Espera' : 
                 (isVoluntario ? 'Amigo' : 'Invitado')}
              </span>
            </div>
          </IonCol>
        );
      })}
    </IonRow>
  </IonGrid>
</div>
		
		
		
		

        {/* MODAL PRINCIPAL DE REGISTRO */}
        <IonModal
  isOpen={showModal}
  onDidDismiss={() => setShowModal(false)}
  initialBreakpoint={0.6}
  breakpoints={[0, 0.6, 0.9]}
>
  <div className="ion-padding pt-8">
    <div className="mb-6 ml-[10px]">
      <h2 className="text-xl font-bold ys-text">
        Añadir {selectedSlot?.member_type === 1 ? 'amig@' : 'Invitad@'}
      </h2>
      {/* Párrafo descriptivo agregado */}
      <p className="text-sm text-slate-500 mt-1 mr-3">
        {selectedSlot?.member_type === 1 
          ? 'Invita a tus amistades y juntos obtengan beneficios.' 
          : 'Añade personas de confianza (familiares o amigos) que te apoyen el día de la votación.'}
      </p>
    </div>

    <div className="space-y-4">
      {selectedSlot?.member_type === 1 ? (
        <>
          <IonItem fill="outline" className="rounded-xl">
            <IonLabel position="stacked">Nombre</IonLabel>
            <IonInput style={{ fontSize: '26px', fontWeight: '600' }} value={formData.name} onIonInput={e => setFormData({ ...formData, name: e.detail.value })} />
          </IonItem>
          <IonItem fill="outline" className="rounded-xl">
            <IonLabel position="stacked">Celular</IonLabel>
            <IonInput style={{ fontSize: '26px', fontWeight: '600' }} maxlength={8} type="tel" value={formData.phone} onIonInput={e => setFormData({ ...formData, phone: e.detail.value })} />
          </IonItem>
        </>
      ) : (
        <>
          <IonItem fill="outline" className="rounded-xl">
            <IonLabel position="stacked">Carnet de Identidad</IonLabel>
            <IonInput style={{ fontSize: '26px', fontWeight: '600' }} value={formData.ci} onIonInput={e => setFormData({ ...formData, ci: e.detail.value })} />
          </IonItem>
          
          <IonItem fill="outline" className="rounded-xl" onClick={() => setShowDatePicker(true)}>
            <IonLabel position="stacked">Fecha de Nacimiento</IonLabel>
            <div className="py-3 font-semibold">
              {formData.fechaNac || 'Seleccionar fecha'}
            </div>
          </IonItem>
        </>
      )}
    </div>

    <div style={{ paddingLeft: '10px', paddingRight: '10px' }}>
      <IonButton
        expand="block"
        color="success"
        className="mt-8 font-bold h-12"
        onClick={handleSave}
        disabled={loading}
      >
        {loading ? <IonSpinner name="crescent" /> : 'Confirmar'}
      </IonButton>
    </div>
  </div>
</IonModal>

        {/* MODAL DEL SELECTOR DE FECHA (SE ABRE SOBRE EL ANTERIOR) */}
        <IonModal
          isOpen={showDatePicker}
          onDidDismiss={() => setShowDatePicker(false)}
          initialBreakpoint={0.335}
          breakpoints={[0, 0.335, 0.6]}
        >
          <IonHeader className="ion-no-border">
            <IonToolbar>
              <IonTitle size="small">Seleccionar Fecha</IonTitle>
              <IonButtons slot="end">
                <IonButton color="primary" className="font-bold" onClick={() => setShowDatePicker(false)}>Listo</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonDatetime
              presentation="date"
              preferWheel={true}
              locale="es-ES"
              size="cover"
              value={formData.fechaNac || '2000-01-01'}
              onIonChange={handleDateChange}
            />
          </IonContent>
        </IonModal>

        <IonToast
          isOpen={showToast.show}
          message={showToast.msg}
          color={showToast.color}
          duration={2000}
          onDidDismiss={() => setShowToast({ ...showToast, show: false })}
        />
		

      </IonContent>
    </IonPage>
  );

};

export default ReferidosPage;