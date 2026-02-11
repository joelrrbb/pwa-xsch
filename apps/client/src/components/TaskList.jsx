import React, { useEffect, useState, useRef } from 'react';
import { 
  IonCard, IonCardContent, IonButton, IonBadge, 
  IonSpinner, IonToast, IonImg, IonText
} from '@ionic/react';
import { checkmarkCircle } from 'ionicons/icons';
import { supabase } from '../supabaseClient';
import WhatsAppBanner from './WhatsAppBanner';

const TaskList = ({ userId }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState({ show: false, points: 0 });
  const [isProcessing, setIsProcessing] = useState(false); // Para evitar doble clic
  
  // Usamos un ref para saber qué tarea está pendiente de validar al volver
  const pendingTaskRef = useRef(null);

  useEffect(() => {
    if (userId) fetchTasks();
  }, [userId]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_available_posts', { user_uuid: userId });
      if (error) throw error;
      setTasks(data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  // Detectar cuando el usuario regresa a la app
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && pendingTaskRef.current) {
        // Al volver, completamos la tarea directamente
        markAsComplete(pendingTaskRef.current);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const startTask = (task) => {
    if (isProcessing) return;
    
    // Guardamos la tarea como "pendiente de completar"
    pendingTaskRef.current = task;
    
    // Abrimos el enlace
    window.open(task.link_url, '_blank');
  };

  const markAsComplete = async (task) => {
    if (!task || isProcessing) return;
    
    setIsProcessing(true);
    const safePoints = Number(task.points) || 0;

    try {
      // 1. Llamada a la DB
      const { error } = await supabase.rpc('process_task_completion', {
        p_post_id: task.id,
        p_user_id: userId,
        p_points: safePoints
      });

      if (error) throw error;

      // 2. Actualizar LocalStorage y notificar al Header/PointsDisplay
      const savedSession = localStorage.getItem('user_session');
      if (savedSession) {
        const sessionData = JSON.parse(savedSession);
        const newTotal = (Number(sessionData.points) || 0) + safePoints;
        
        localStorage.setItem('user_session', JSON.stringify({ ...sessionData, points: newTotal }));
        window.dispatchEvent(new Event('points-updated'));
      }

      // 3. UI Feedback
      setShowToast({ show: true, points: safePoints });
      setTasks(prev => prev.filter(t => t.id !== task.id));
      
    } catch (err) {
      console.error("Error al procesar puntos:", err.message);
    } finally {
      // Limpiamos todo
      pendingTaskRef.current = null;
      setIsProcessing(false);
    }
  };

  const getTimeRemainingText = (deadline) => {
    if (!deadline) return null;
    const diff = Date.parse(deadline) - Date.now();
    if (diff <= 0) return "Expirado";
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `Termina en: ${days}d ${hours}h`;
    if (hours > 0) return `Termina en: ${hours}h ${minutes}m`;
    return `Termina en: ${minutes}m`;
  };

  if (loading) return <div style={{textAlign:'center', marginTop:'20px'}}><IonSpinner name="crescent" /></div>;

  return (
    <div>
      <IonText color="dark"><h2 className="ys-text">Tareas disponibles</h2></IonText>
      <WhatsAppBanner />

      {tasks.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666' }}>No hay tareas pendientes</p>
      ) : (
        tasks.map(task => {
          const remainingText = getTimeRemainingText(task.deadline);

          return (
            <IonCard key={task.id} style={{ margin: '12px 0', borderRadius: '12px' }}>
              <IonCardContent style={{ display: 'flex', padding: '12px', gap: '12px' }}>
                
                <div style={{ width: '50px', height: '50px', flexShrink: 0 }}>
                  <IonImg src={task.thumbnail} style={{ borderRadius: '8px', objectFit: 'cover', height: '100%' }} />
                </div>

                <div style={{ flexGrow: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h2 className="ys-text" style={{ margin: '0', color: '#000', fontSize: '1rem' }}>{task.caption}</h2>
                    <IonBadge style={{ marginLeft: '10px', background:'#48dd55' }}>
                      +{task.points} pts
                    </IonBadge>
                  </div>
                  
                  <p style={{ margin: '5px 0', fontSize: '0.85rem', color: '#666' }}>{task.description}</p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                    <IonButton 
                      size="small" 
                      onClick={() => startTask(task)}
                      disabled={isProcessing || remainingText === "Expirado"}
                      style={{ '--border-radius': '6px', margin: 0 }}
                    >
                      {isProcessing && pendingTaskRef.current?.id === task.id ? 'Validando...' : 'Realizar tarea'}
                    </IonButton>

                    {remainingText && (
                      <span style={{ fontSize: '0.75rem', color: remainingText === "Expirado" ? "red" : "#999" }}>
                        {remainingText}
                      </span>
                    )}
                  </div>
                </div>
              </IonCardContent>
            </IonCard>
          );
        })
      )}

      <IonToast
        isOpen={showToast.show}
        onDidDismiss={() => setShowToast({ show: false, points: 0 })}
        message={`¡Tarea completada! +${showToast.points} puntos`}
        duration={3000}
        color="dark"
        position="top"
        icon={checkmarkCircle}
      />
    </div>
  );
};

export default TaskList;