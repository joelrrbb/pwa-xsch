import React, { useState, useEffect } from 'react';
import { 
  IonButton, IonModal, IonHeader, IonToolbar, 
  IonTitle, IonButtons, IonIcon, IonContent, 
  IonNote, IonBadge
} from '@ionic/react';
import { 
  qrCodeOutline, 
  closeOutline, 
  shieldCheckmarkOutline 
} from 'ionicons/icons';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '../supabaseClient';

const QRAsistencia = ({ userId }) => {
  const [showModal, setShowModal] = useState(false);
  const [qrValue, setQrValue] = useState('');
  const [eventCode, setEventCode] = useState(null);
  const [pointsAwarded, setPointsAwarded] = useState(null);

  // 🔹 Obtener configuración del evento
  const loadEventConfig = async () => {
    const { data, error } = await supabase
      .from('system_conf')
      .select('current_event, points_event')
      .limit(1)
      .single();

    if (error) {
      console.error('Error cargando systemconf:', error);
      return;
    }

    setEventCode(data.current_event);
    setPointsAwarded(data.points_event);
  };

  // 🔹 Generar QR
  const generateCode = () => {
    if (!userId || !eventCode || pointsAwarded === null) return;

    const timeSegment = Math.floor(Date.now() / 30000);

    const payload = {
      user_id: userId,
      event_code: eventCode,
      point_awarded: pointsAwarded,
      ts: timeSegment
    };

    console.log('Payload QR:', payload);

    setQrValue(JSON.stringify(payload));
  };

  // 🔹 Cargar config al abrir modal
  useEffect(() => {
    if (showModal) {
      loadEventConfig();
    }
  }, [showModal]);

  // 🔹 Regenerar QR cada 30s
  useEffect(() => {
    let interval;
    if (showModal && eventCode) {
      generateCode();
      interval = setInterval(generateCode, 30000);
    }
    return () => clearInterval(interval);
  }, [showModal, userId, eventCode, pointsAwarded]);

  return (
    <>
      <IonButton 
        expand="block"
        onClick={() => setShowModal(true)}
        className="ion-margin-top font-bold"
        style={{ '--border-radius': '14px' }}
        color="dark"
      >
        <IonIcon slot="start" icon={qrCodeOutline} />
        MI CÓDIGO QR
      </IonButton>

      <IonModal
        isOpen={showModal}
        onDidDismiss={() => setShowModal(false)}
        initialBreakpoint={0.8}
        breakpoints={[0, 0.8, 0.8]}
        handleBehavior="cycle"
        className="white-modal"
      >
        <IonHeader className="ion-no-border">
          <IonToolbar color="light">
            <IonTitle className="ys-text-sm">Asistencia</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setShowModal(false)}>
                <IonIcon icon={closeOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent className="ion-padding ion-text-center" color="light">
          <div className="flex flex-col items-center pt-6">

            <div className="p-5 bg-white rounded-[2rem] shadow-xl border border-slate-100 mb-15">
              {qrValue ? (
                <QRCodeSVG 
                  value={qrValue}
                  size={240}
                  level="H"
                />
              ) : (
                <div className="w-[240px] h-[240px] flex items-center justify-center">
                  <IonNote>Generando código…</IonNote>
                </div>
              )}
            </div>

            <IonBadge className="ai-badge flex items-center gap-1 px-4 py-1 mb-4 rounded-full text-xs font-medium tracking-wide">
              <IonIcon icon={shieldCheckmarkOutline} />
              Validación inteligente
            </IonBadge>

            <p className="text-sm text-slate-500 px-6 leading-relaxed">
              Evento <strong>{eventCode}</strong> ·  
              Puntos: <strong>{pointsAwarded}</strong><br />
              Muestra este código para registrar tu asistencia.  
              El sistema lo actualiza automáticamente durante el evento.
            </p>

          </div>
        </IonContent>
      </IonModal>

      {/* Estilos */}
      <style>{`
        .white-modal::part(content) {
          background: #ffffff;
        }

        .ai-badge {
          backdrop-filter: blur(6px);
          background: linear-gradient(
            135deg,
            rgba(34,197,94,0.18),
            rgba(34,197,94,0.06)
          );
          border: 1px solid rgba(34,197,94,0.35);
          color: #166534;
        }
      `}</style>
    </>
  );
};

export default QRAsistencia;
