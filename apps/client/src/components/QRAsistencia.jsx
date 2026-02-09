import React, { useState, useEffect } from 'react';
import { 
  IonModal, IonHeader, IonToolbar, 
  IonTitle, IonButtons, IonButton, IonIcon, 
  IonContent, IonNote, IonBadge 
} from '@ionic/react';
import { 
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

  // 🔹 Cargar configuración desde Supabase
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

  // 🔹 Generar Payload del QR
  const generateCode = () => {
    if (!userId || !eventCode || pointsAwarded === null) return;
    const timeSegment = Math.floor(Date.now() / 30000);
    const payload = {
      user_id: userId,
      event_code: eventCode,
      point_awarded: pointsAwarded,
      ts: timeSegment
    };
    setQrValue(JSON.stringify(payload));
  };

  useEffect(() => {
    if (showModal) loadEventConfig();
  }, [showModal]);

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
      {/* BOTÓN NEGRO ESTILO APPLE CON TU SVG */}
      <button 
        onClick={() => setShowModal(true)} 
        className="qr-trigger-apple"
      >
        <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g id="SVGRepo_iconCarrier">
            <path 
              fillRule="evenodd" 
              clipRule="evenodd" 
              d="M5 8a1 1 0 0 1-2 0V5.923c0-.76.082-1.185.319-1.627.223-.419.558-.754.977-.977C4.738 3.082 5.162 3 5.923 3H8a1 1 0 0 1 0 2H5.923c-.459 0-.57.022-.684.082a.364.364 0 0 0-.157.157c-.06.113-.082.225-.082.684V8zm3 11a1 1 0 1 1 0 2H5.923c-.76 0-1.185-.082-1.627-.319a2.363 2.363 0 0 1-.977-.977C3.082 19.262 3 18.838 3 18.077V16a1 1 0 1 1 2 0v2.077c0 .459.022.57.082.684.038.07.087.12.157.157.113.06.225.082.684.082H8zm7-15a1 1 0 0 0 1 1h2.077c.459 0 .57.022.684.082.07.038.12.087.157.157.06.113.082.225.082.684V8a1 1 0 1 0 2 0V5.923c0-.76-.082-1.185-.319-1.627a2.363 2.363 0 0 0-.977-.977C19.262 3.082 18.838 3 18.077 3H16a1 1 0 0 0-1 1zm4 12a1 1 0 1 1 2 0v2.077c0 .76-.082 1.185-.319 1.627a2.364 2.364 0 0 1-.977.977c-.442.237-.866.319-1.627.319H16a1 1 0 1 1 0-2h2.077c.459 0 .57-.022.684-.082a.363.363 0 0 0 .157-.157c.06-.113.082-.225.082-.684V16zM3 11a1 1 0 1 0 0 2h18a1 1 0 1 0 0-2H3z" 
              fill="#ffffff"
            />
          </g>
        </svg>
      </button>

      {/* MODAL */}
      <IonModal
        isOpen={showModal}
        onDidDismiss={() => setShowModal(false)}
        initialBreakpoint={0.8}
        breakpoints={[0, 0.8]}
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
            
            <div className="p-5 bg-white rounded-[2rem] shadow-xl border border-slate-100 mb-6">
              {qrValue ? (
                <QRCodeSVG value={qrValue} size={240} level="H" />
              ) : (
                <div className="w-[240px] h-[240px] flex items-center justify-center">
                  <IonNote>Generando código…</IonNote>
                </div>
              )}
            </div>

            <IonBadge className="ai-badge flex items-center gap-1 px-4 py-1 mb-4 rounded-full text-xs font-medium">
              <IonIcon icon={shieldCheckmarkOutline} />
              Validación inteligente
            </IonBadge>

            {/* RESTAURADO: Texto de puntos e instrucciones */}
            <p className="text-sm text-slate-500 px-6 leading-relaxed">
              Evento <strong>{eventCode || '...'}</strong> · 
              Puntos: <strong>{pointsAwarded || '0'}</strong><br />
              Muestra este código para registrar tu asistencia. 
              El sistema lo actualiza automáticamente durante el evento.
            </p>

          </div>
        </IonContent>
      </IonModal>

      <style>{`
        .qr-trigger-apple {
          background: #000000;
          width: 40px;
          height: 40px;
          border-radius: 12px; 
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          transition: transform 0.1s ease;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          padding: 0;
          outline: none;
        }

        .qr-trigger-apple:active {
          transform: scale(0.92);
          background: #1a1a1a;
        }

        .white-modal::part(content) {
          background: #ffffff;
          border-radius: 32px 32px 0 0;
        }

        .ai-badge {
          backdrop-filter: blur(6px);
          background: linear-gradient(135deg, rgba(34,197,94,0.18), rgba(34,197,94,0.06));
          border: 1px solid rgba(34,197,94,0.35);
          color: #166534;
        }

        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .items-center { align-items: center; }
        .pt-6 { padding-top: 1.5rem; }
        .mb-6 { margin-bottom: 1.5rem; }
      `}</style>
    </>
  );
};

export default QRAsistencia;