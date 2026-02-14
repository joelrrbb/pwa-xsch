import React, { useState, useEffect, useCallback } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton,
  IonButtons, IonGrid, IonRow, IonCol, IonIcon, IonModal, IonItem,
  IonLabel, IonInput, IonButton, IonText, IonToast, IonSpinner, IonDatetime, IonImg
} from '@ionic/react';
import MembersProgressBar from '../components/MembersProgressBar';
import { checkmarkCircle, timeOutline, personAddOutline, closeCircleOutline} from 'ionicons/icons';

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
    return Array.from({ length: 10 }, (_, i) => ({ id_slot: i + 1, member_type: 0, tier: null }));
  }
  return Array.from({ length: 20 }, (_, i) => ({ id_slot: i + 1, member_type: 0, tier: null }));
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
  const [showDatePicker, setShowDatePicker] = useState(false); // Estado para el modal de fecha
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showToast, setShowToast] = useState({ show: false, msg: '', color: 'success' });
  const [formData, setFormData] = useState({ name: '', phone: '', ci: '', fechaNac: '' });
  const generateAccessCode = () => Math.floor(100000 + Math.random() * 900000).toString();

  const slotsConfig = GET_USER_CONFIG(currentUser);

  const loadData = useCallback(async () => {
    setFetching(true);
    try {
      const res = await fetch(`${API_BASE_URL}/get-referidos?referrer_id=${currentUser.id}`);
      const result = await res.json();
      if (result.code === 0) setReferidosDB(result.data);
    } catch (e) {
      console.error('Error cargando referidos');
    } finally {
      setFetching(false);
    }
  }, [currentUser.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openSlot = (config, existingData) => {
    if (existingData) return;
    setSelectedSlot(config);
    setFormData({ name: '', phone: '', ci: '', fechaNac: '' });
    setShowModal(true);
  };

  const handleDateChange = (e) => {
    const value = e.detail.value;
    const formattedDate = value ? value.split('T')[0] : '';
    setFormData({ ...formData, fechaNac: formattedDate });
  };

  const handleSave = async () => {
    const isVoluntary = selectedSlot.member_type === 1;

    // 1. Validaciones para Voluntario
    if (isVoluntary) {
      if (!formData.phone || !formData.name) {
        alert('Nombre y Celular requeridos');
        return;
      }
      // Validación de formato de celular (Empieza con 6 o 7 y tiene 8 dígitos)
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
	const accessCode = isVoluntary ? generateAccessCode() : null;
    const payload = {
      name: isVoluntary ? formData.name : 'Invitado',
      phone: isVoluntary ? formData.phone : Math.floor(1000000 + Math.random() * 9000000).toString(),
      identity_card: formData.ci,
      birth_date: formData.fechaNac || null,
      member_type: Number(selectedSlot.member_type),
      tier: isVoluntary ? Number(selectedSlot.tier) : null,
      is_verified: isVoluntary ? 0 : 1,
      referrer_id: currentUser.id,
	  access_code: accessCode,
      id_slot: selectedSlot.id_slot
    };
	
	console.log('📦 ENVIANDO PAYLOAD AL BACKEND:', payload);

    try {
      const response = await fetch(`${API_BASE_URL}/add-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (result.code === 0) {
        setShowToast({ show: true, msg: '¡Registro exitoso!', color: 'success' });
        setShowModal(false);
        loadData();

        // --- LÓGICA DE WHATSAPP PARA VOLUNTARIOS ---
        if (isVoluntary) {
          const mensaje = 
			`¡Hola! 👋 Bienvenido al equipo.\n\n` +
			`Entra aquí para activar tu cuenta:\n` +
            `👉 https://pwa-xsch-client.vercel.app/\n\n` +
            `Tu código es: *${accessCode}*\n\n` +
			`¡Estamos felices de tenerte con nosotros! ✨`;
          const encodedMsg = encodeURIComponent(mensaje);
          
          // Suponiendo que el prefijo del país es +591 (Bolivia), ajústalo si es necesario
          const whatsappUrl = `https://wa.me/591${formData.phone}?text=${encodedMsg}`;

          // Redirigir después de 1.5 segundos para que vea el Toast
          window.location.assign(whatsappUrl);
        }
		
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
        <IonToolbar style={{ '--background': '#ffffff', '--color': '#000000' }}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" text="Atrás" />
          </IonButtons>
          <IonTitle className="ys-text">Mis Referidos</IonTitle>
          {fetching && <IonSpinner slot="end" name="crescent" className="mr-4" />}
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding bg-slate-50">
	  
	  
	  
       <div className="p-6 bg-white rounded-[2.5rem] shadow-[0_15px_40px_rgba(34,197,94,0.08)] border border-green-50">
		<div className="mb-4">
			<IonText className="text-[11px] uppercase font-black text-slate-400 tracking-[0.15em] block mb-1">
			Crecimiento de Equipo
			</IonText>
			<h2 className="ys-text-sm">
			Comunidad <span className="text-green-500">Activa</span>
			</h2>
			</div>

			<MembersProgressBar 
				current={currentUser?.referrals?.length || 12} 
				target={50} />
		</div>
		
		<div className="flex items-center gap-3 px-6">
			<h2 className="ys-text-sm">
			Compañeros de equipo
			</h2>
		</div>
		
        <IonGrid>
          <IonRow>
            {slotsConfig.map((config, i) => {
              const isVoluntario = config.member_type === 1;
              const data = referidosDB.find(d => d.id_slot === config.id_slot);
			  const isRejected = data?.is_verified === 3;

              return (
                <IonCol size="3" key={i} className="flex flex-col items-center mb-4">
                  <div
                    onClick={() => openSlot(config, data)}
						className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all relative border-2
						${isRejected ? 'bg-red-500 border-red-600 text-white' : 
						data?.is_verified >= 2 ? 'bg-green-500 border-green-600 text-white' : 
						data ? 'bg-amber-100 border-amber-400 text-amber-600 shadow-inner' : 
						isVoluntario ? 'bg-white border-orange-400 border-dashed text-orange-400' : 
						'bg-gray-100 border-gray-200 text-gray-400'}
					`}
					>
                    {isRejected ? <IonIcon icon={closeCircleOutline} /> : // Icono de re-intento si está rechazado
					data?.is_verified >= 2 ? <IonIcon icon={checkmarkCircle} /> : 
					data ? <IonIcon icon={timeOutline} /> : 
					<IonIcon icon={personAddOutline} className="opacity-30" />}
                    
                    {isVoluntario && (
                      <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold shadow-sm">
                        T-{config.tier}
                      </div>
                    )}
                  </div>
                  <span className={`text-[10px] mt-1 font-bold uppercase ${data ? 'text-slate-700' : 'text-gray-400'}`}>
						{isRejected ? 'Rechazado' : (data?.is_verified >= 1 ? data.name : (isVoluntario ? 'Voluntario' : 'Invitado'))}
				  </span>
                </IonCol>
              );
            })}
          </IonRow>
        </IonGrid>
		
		
		
		

        {/* MODAL PRINCIPAL DE REGISTRO */}
        <IonModal
          isOpen={showModal}
          onDidDismiss={() => setShowModal(false)}
          initialBreakpoint={0.5}
          breakpoints={[0, 0.5, 0.9]}
        >
          <div className="ion-padding pt-8">
            <h2 className="text-xl font-bold mb-4 ml-[10px] ys-text">
              Registro de {selectedSlot?.member_type === 1 ? 'Voluntario' : 'Invitado'}
            </h2>

            <div className="space-y-4">
              {selectedSlot?.member_type === 1 ? (
                <>
                  <IonItem fill="outline" className="rounded-xl">
                    <IonLabel position="stacked">Nombre</IonLabel>
                    <IonInput style={{ fontSize: '26px', fontWeight: '600' }} value={formData.name} onIonInput={e => setFormData({ ...formData, name: e.detail.value })} />
                  </IonItem>
                  <IonItem fill="outline" className="rounded-xl">
                    <IonLabel position="stacked">Celular</IonLabel>
                    <IonInput style={{ fontSize: '26px', fontWeight: '600' }}  maxlength={8} type="tel" value={formData.phone} onIonInput={e => setFormData({ ...formData, phone: e.detail.value })} />
                  </IonItem>
                </>
              ) : (
                <>
                  <IonItem fill="outline" className="rounded-xl">
                    <IonLabel position="stacked">Carnet de Identidad</IonLabel>
                    <IonInput style={{ fontSize: '26px', fontWeight: '600' }} value={formData.ci} onIonInput={e => setFormData({ ...formData, ci: e.detail.value })} />
                  </IonItem>
                  
                  {/* DISPARADOR DEL SELECTOR DE FECHA */}
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