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
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Lógica de retorno: Espera 1 segundo exacto tras volver a la app
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && pendingTaskRef.current) {
        // Extraemos la tarea y limpiamos la referencia inmediatamente
        const taskToComplete = pendingTaskRef.current;
        pendingTaskRef.current = null; 

        // Retraso de 1000ms solicitado
        setTimeout(() => {
          markAsComplete(taskToComplete);
        }, 1000);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [userId]);

  const startTask = (task) => {
    pendingTaskRef.current = task;
    window.open(task.link_url, '_blank');
  };

  const markAsComplete = async (task) => {
    if (!task || !userId) return;
    const safePoints = Number(task.points) || 0;

    try {
      // 1. Ejecutar en Supabase
      const { error } = await supabase.rpc('process_task_completion', {
        p_post_id: task.id,
        p_user_id: userId,
        p_points: safePoints
      });

      if (error) throw error;

      // 2. Sincronizar LocalStorage para el Header
      const savedSession = localStorage.getItem('user_session');
      if (savedSession) {
        const sessionData = JSON.parse(savedSession);
        const newTotal = (Number(sessionData.points) || 0) + safePoints;
        localStorage.setItem('user_session', JSON.stringify({ ...sessionData, points: newTotal }));
        window.dispatchEvent(new Event('points-updated'));
      }

      // 3. Feedback visual (UI)
      setTasks(prev => prev.filter(t => t.id !== task.id));
      setShowToast({ show: true, points: safePoints });
      
    } catch (err) {
      console.error("Error al procesar la tarea:", err.message);
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

      {tasks.map(task => {
        const remainingText = getTimeRemainingText(task.deadline);
        return (
          <IonCard key={task.id} style={{ margin: '12px 0', borderRadius: '12px' }}>
            <IonCardContent style={{ display: 'flex', padding: '12px', gap: '12px' }}>
              
              <div style={{ width: '50px', height: '50px', flexShrink: 0 }}>
                <IonImg src={task.thumbnail} style={{ borderRadius: '8px', objectFit: 'cover', height: '100%' }} />
              </div>

              <div style={{ flexGrow: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h2 className="ys-text" style={{ margin: '0', color: '#000', flex: 1 }}>{task.caption}</h2>
                  <IonBadge style={{ marginLeft: '10px', padding:'5px', background:'#48dd55' }}>
                    +{task.points || 0} puntos
                  </IonBadge>
                </div>
                
                <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#444' }}>{task.description}</p>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                  <IonButton 
                    size="small" 
                    onClick={() => startTask(task)}
                    disabled={remainingText === "Expirado"}
                    style={{ '--border-radius': '6px', margin: 0 }}
                  >
                    Realizar tarea
                  </IonButton>

                  {remainingText && (
                    <span style={{ fontSize: '0.75rem', color: remainingText === "Expirado" ? "red" : "#888" }}>
                      {remainingText}
                    </span>
                  )}
                </div>
              </div>
            </IonCardContent>
          </IonCard>
        );
      })}

      <IonToast
        isOpen={showToast.show}
        onDidDismiss={() => setShowToast({ show: false, points: 0 })}
        message={`¡Tarea completada! Has ganado ${showToast.points} puntos`}
        duration={3000}
        color="dark"
        position="top"
        icon={checkmarkCircle}
      />
    </div>
  );
};

export default TaskList;