import React, { useState, useEffect} from 'react';
import {
  IonIcon,
  IonTextarea,
  IonSpinner,
  IonToast,
  IonCard,
  IonCardContent,
  IonBadge,
  IonRouterLink
} from '@ionic/react';
import { 
  sparkles, 
  copyOutline, 
  refreshOutline, 
  checkmarkCircleOutline ,
  checkmarkCircle
} from 'ionicons/icons';

import { supabase } from '../supabaseClient';

const GeminiCommenter = () => {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [copied, setCopied] = useState(false);
  const [gistUrl, setGistUrl] = useState(null);
  
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('comments')
          .select('url_gist')
          .limit(1)
          .single();

        if (error) throw error;
        if (data) setGistUrl(data.url_gist);
      } catch (err) {
        console.error("Error conectando con Supabase:", err.message);
      }
    };

    fetchConfig();
  }, []);

  const generateComment = async () => {
    if (!gistUrl) return;

    setLoading(true);
    setCopied(false);
    
    const delay = (ms) => new Promise(res => setTimeout(res, ms));

    try {
      // Fetch al Gist configurado en la base de datos
      const [response] = await Promise.all([
        fetch(gistUrl, { cache: 'no-store' }),
        delay(1000) // Delay est?tico de procesamiento
      ]);

      if (!response.ok) throw new Error('Error al leer fuente de datos');
      
      const frases = await response.json();

      if (Array.isArray(frases) && frases.length > 0) {
        const randomIndex = Math.floor(Math.random() * frases.length);
        setComment(frases[randomIndex]);
      }
    } catch (error) {
      console.error("Error al generar:", error);
      setComment("Sucre adelante con fuerza y renovación!");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!comment) return;
    navigator.clipboard.writeText(comment).then(() => {
      setShowToast(true);
      setCopied(true);
      // Volver al icono original despu?s de 2 segundos
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{ padding: '0 4px' }}>
	
	<style>{ANIMATION_STYLES}</style>
	
      <IonCard style={styles.mainCard}>
        <IonCardContent style={{ padding: '20px' }}>
          
          {/* Encabezado Institucional */}
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <div style={styles.iaIcon}>
                <IonIcon icon={sparkles} style={{ color: '#fff' }} />
              </div>
              <div style={{ marginLeft: '12px' }}>
                <h3 style={styles.title}>Asistente Digital</h3>
                <span style={styles.subtitle}>IA ESTRATÉGICA XS-CH</span>
              </div>
            </div>
			
			
            <IonRouterLink routerLink="/downloads" routerDirection="forward" style={{ textDecoration: 'none' }}>
  <div style={styles.aiAssetsBtn}>
    <IonIcon className="sparkle-motion" icon={sparkles} style={{ fontSize: '10px', marginRight: '4px' }} />
    RECURSOS
  </div>
</IonRouterLink>


          </div>

          {/* Caja de Comentario */}
          <div style={styles.commentBox}>
            <IonTextarea
              value={comment}
              onIonChange={e => setComment(e.detail.value)}
              placeholder="Presiona generar para obtener un comentario de apoyo..."
              rows={2}
              readonly={loading}
              style={styles.textarea}
            />
          </div>

          {/* Botones de Acci?n */}
          <div style={styles.buttonGroup}>
            
            {/* Bot?n Generar (75% del ancho) */}
            <button 
              onClick={generateComment} 
              disabled={loading}
              style={{
                ...styles.primaryBtn,
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? (
                <IonSpinner name="crescent" color="light" style={{ width: '24px', height: '24px' }} />
              ) : (
                <>
                  <IonIcon icon={refreshOutline} style={{ marginRight: '10px', fontSize: '1.2rem' }} />
                  Generar comentario
                </>
              )}
            </button>

            {/* Bot?n Copiar (25% del ancho) */}
            <button 
              onClick={copyToClipboard}
              disabled={!comment || loading}
              style={{
                ...styles.secondaryBtn,
                background: comment ? (copied ? '#2dd36f' : '#0052cc') : '#f0f4f9',
                color: comment ? '#fff' : '#0052cc',
              }}
            >
              <IonIcon 
                icon={copied ? checkmarkCircleOutline : copyOutline} 
                style={{ fontSize: '1.5rem' }} 
              />
            </button>
          </div>

        </IonCardContent>
      </IonCard>

      {/* Notificaci�n Flotante */}
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message="Texto copiado. Pégalo en tus redes."
        duration={2000}
        position="bottom"
		color="dark"
		icon={checkmarkCircle}
      />
    </div>
  );
};

const styles = {
  mainCard: {
    borderRadius: '24px',
    boxShadow: '0 12px 30px rgba(0,0,0,0.07)',
    border: '1px solid #f2f2f2',
    background: '#ffffff',
    margin: '15px 0'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '18px'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center'
  },
  iaIcon: {
    background: 'linear-gradient(135deg, #1a1a1a 0%, #444 100%)',
    width: '38px',
    height: '38px',
    borderRadius: '12px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
  },
  title: {
    margin: 0,
    fontSize: '1.05rem',
    fontWeight: '850',
    color: '#1a1a1a',
    letterSpacing: '-0.3px'
  },
  subtitle: {
    fontSize: '0.65rem',
    fontWeight: '700',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: '0.8px'
  },
  badge: {
    fontSize: '0.55rem',
    padding: '4px 8px',
    borderRadius: '6px',
    letterSpacing: '0.5px'
  },
  commentBox: {
    background: '#f8f9fc',
    borderRadius: '18px',
    border: '1px solid #edf0f5',
    marginBottom: '16px'
  },
  textarea: {
    '--padding-start': '16px',
    '--padding-end': '16px',
    '--padding-top': '16px',
    fontSize: '0.95rem',
    fontWeight: '500',
    color: '#333',
    minHeight: '115px',
    lineHeight: '1.5'
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    width: '100%'
  },
  primaryBtn: {
    flex: 3,
    height: '54px',
    background: '#1a1a1a',
    color: '#fff',
    border: 'none',
    borderRadius: '16px',
    fontWeight: '700',
    fontSize: '0.95rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
    transition: 'all 0.2s ease'
  },
  secondaryBtn: {
    flex: 1,
    height: '54px',
    border: 'none',
    borderRadius: '16px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 4px 10px rgba(0,0,0,0.04)',
    transition: 'all 0.3s ease'
  },
  aiAssetsBtn: {
    background: 'linear-gradient(135deg, #f5f7ff 0%, #eeefff 100%)',
    color: '#5856d6', // Color estilo IA/Siri/Copilot
    fontSize: '0.65rem',
    fontWeight: '800',
    padding: '6px 12px',
    borderRadius: '10px',
    letterSpacing: '0.5px',
    border: '1px solid #dadaff',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(88, 86, 214, 0.1)',
    textTransform: 'uppercase'
  }
};

const ANIMATION_STYLES = `
  @keyframes sparkle-rotate {
    0% { transform: rotate(0deg) scale(1); filter: brightness(1); }
    50% { transform: rotate(20deg) scale(1.2); filter: brightness(1.3); }
    100% { transform: rotate(0deg) scale(1); filter: brightness(1); }
  }
  .sparkle-motion {
    animation: sparkle-rotate 2s infinite ease-in-out;
    display: inline-block;
  }
`;

export default GeminiCommenter;