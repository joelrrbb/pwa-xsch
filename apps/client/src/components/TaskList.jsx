import React, { useEffect, useState, useRef } from 'react';
import { 
  IonCard, IonCardContent, IonButton, IonIcon, IonBadge, 
  IonSpinner, IonToast, IonImg, IonText
} from '@ionic/react';
import { timeOutline, checkmarkCircle, playOutline, starOutline} from 'ionicons/icons';
import { supabase } from '../supabaseClient';
import { usePoints } from '../hooks/usePoints';
import WhatsAppBanner from './WhatsAppBanner';

const TaskList = ({ userId }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState({ show: false, points: 0 });
  const [timeLeft, setTimeLeft] = useState(null); 
  const { updatePoints } = usePoints();
  
  const activeTaskRef = useRef(null);
  const startTimeRef = useRef(null);
  const timerIntervalRef = useRef(null);

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

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && activeTaskRef.current) {
        clearInterval(timerIntervalRef.current);
        const secondsOut = (Date.now() - startTimeRef.current) / 1000;
        const required = activeTaskRef.current.duration || 0;

        if (secondsOut >= required) {
          markAsComplete(activeTaskRef.current);
        } else {
          activeTaskRef.current = null;
          setTimeLeft(null);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const startTask = (task) => {
    activeTaskRef.current = task;
    startTimeRef.current = Date.now();
    setTimeLeft(task.duration);
    
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    window.open(task.link_url, '_blank');
  };

const markAsComplete = async (task) => {
    // 1. Validaciones iniciales
    if (!task || !task.id || !userId) {
      console.error("Faltan datos para completar la tarea");
      return;
    }

    // 2. Aseguramos que los puntos sean un número válido (evita el error de numeric "")
    const safePoints = Number(task.points) || 0;

    try {
      // 3. Llamada al RPC definitivo (process_task_completion)
      const { error } = await supabase.rpc('process_task_completion', {
        p_post_id: task.id,
        p_user_id: userId,
        p_points: safePoints
      });

      if (error) throw error;

      /* ========================================================
         LÓGICA REACTIVA DE PUNTOS
         ======================================================== */
      // 4. Obtenemos la sesión actual del localStorage
      const savedSession = localStorage.getItem('user_session');
      if (savedSession) {
        const sessionData = JSON.parse(savedSession);
        
        // 5. Calculamos el nuevo total sumando los puntos ganados
        const currentPoints = Number(sessionData.points) || 0;
        const newTotal = currentPoints + safePoints;

        // 6. Actualizamos el localStorage con el nuevo balance
        const updatedSession = { ...sessionData, points: newTotal };
        localStorage.setItem('user_session', JSON.stringify(updatedSession));

        // 7. Disparamos el evento para que PointsDisplay se actualice solo
        window.dispatchEvent(new Event('points-updated'));
      }

      /* ========================================================
         ACTUALIZACIÓN DE INTERFAZ LOCAL (LISTA)
         ======================================================== */
      // 8. Quitamos la tarea de la lista visual
      setTasks(prev => prev.filter(t => t.id !== task.id));
      
      // 9. Mostramos feedback al usuario
      setShowToast({ show: true, points: safePoints });
      
      // 10. Limpiamos referencias del temporizador
      activeTaskRef.current = null;
      setTimeLeft(null);

    } catch (err) {
      console.error("Error al procesar la tarea:", err.message);
      // Aquí podrías mostrar un toast de error si lo deseas
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
        const isCurrentActive = activeTaskRef.current?.id === task.id;
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
                  {/* Visualización de Puntos */}
                  <IonBadge style={{ marginLeft: '10px', padding:'5px', background:'#48dd55' }}>
                    +{task.points || 0} puntos
                  </IonBadge>
                </div>
                
                <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#444' }}>{task.description}</p>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IonButton 
                      size="small" 
                      onClick={() => startTask(task)}
                      disabled={remainingText === "Expirado"}
                      style={{ '--border-radius': '6px', margin: 0 }}
                    >
                      
                      Realizar tarea
                    </IonButton>

                    {isCurrentActive && (
                      <IonBadge color={timeLeft === 0 ? "success" : "warning"}>
                        {timeLeft > 0 ? `${timeLeft}s` : "¡Listo!"}
                      </IonBadge>
                    )}
                  </div>

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