import React, { useEffect, useState, useRef } from 'react';
import { 
  IonCard, IonCardContent, IonButton, IonSpinner, 
  IonToast, IonImg, IonText, IonBadge 
} from '@ionic/react';
import { checkmarkCircle } from 'ionicons/icons';
import { supabase } from '../supabaseClient';
import WhatsAppBanner from './WhatsAppBanner';

const TaskList = ({ userId }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState({ show: false, points: 0 });
  
  // Este Ref guarda la tarea que el usuario "fue a hacer"
  const taskInProgressRef = useRef(null);

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

  // ESTA ES LA CLAVE: Detectar el regreso a la App
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Si la app vuelve a estar visible Y hay una tarea pendiente en el Ref
      if (document.visibilityState === 'visible' && taskInProgressRef.current) {
        completeTask(taskInProgressRef.current);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const startTask = (task) => {
    // 1. Guardamos la tarea en el Ref antes de salir
    taskInProgressRef.current = task;
    // 2. Abrimos el enlace
    window.open(task.link_url, '_blank');
  };

  const completeTask = async (task) => {
    const safePoints = Number(task.points) || 0;

    try {
      // 1. Registrar en Supabase
      const { error } = await supabase.rpc('process_task_completion', {
        p_post_id: task.id,
        p_user_id: userId,
        p_points: safePoints
      });

      if (error) throw error;

      // 2. Actualizar balance local (LocalStorage)
      const savedSession = localStorage.getItem('user_session');
      if (savedSession) {
        const sessionData = JSON.parse(savedSession);
        const newTotal = (Number(sessionData.points) || 0) + safePoints;
        localStorage.setItem('user_session', JSON.stringify({ ...sessionData, points: newTotal }));
        
        // 3. Notificar a otros componentes (Header/PointsDisplay)
        window.dispatchEvent(new Event('points-updated'));
      }

      // 4. Feedback visual: Mostrar Toast y quitar de la lista
      setShowToast({ show: true, points: safePoints });
      setTasks(prev => prev.filter(t => t.id !== task.id));

    } catch (err) {
      console.error("Error al completar:", err.message);
    } finally {
      // 5. Limpiamos el Ref para que no se ejecute doble al cambiar de pestaña otra vez
      taskInProgressRef.current = null;
    }
  };

  if (loading) return <div style={{textAlign:'center', marginTop:'20px'}}><IonSpinner name="crescent" /></div>;

  return (
    <div>
      <IonText color="dark"><h2 className="ys-text">Tareas disponibles</h2></IonText>
      <WhatsAppBanner />

      {tasks.length === 0 ? (
        <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>No hay más tareas por ahora.</p>
      ) : (
        tasks.map(task => (
          <IonCard key={task.id} style={{ margin: '12px 0', borderRadius: '12px' }}>
            <IonCardContent style={{ display: 'flex', padding: '12px', gap: '12px' }}>
              <div style={{ width: '50px', height: '50px', flexShrink: 0 }}>
                <IonImg src={task.thumbnail} style={{ borderRadius: '8px', objectFit: 'cover', height: '100%' }} />
              </div>

              <div style={{ flexGrow: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h2 className="ys-text" style={{ margin: '0', color: '#000', fontSize: '1rem' }}>{task.caption}</h2>
                  <IonBadge color="success">+{task.points} pts</IonBadge>
                </div>
                <p style={{ margin: '5px 0', fontSize: '0.85rem', color: '#444' }}>{task.description}</p>
                <IonButton 
                  size="small" 
                  expand="block"
                  onClick={() => startTask(task)}
                  style={{ '--border-radius': '6px', marginTop: '8px' }}
                >
                  Realizar tarea
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>
        ))
      )}

      <IonToast
        isOpen={showToast.show}
        onDidDismiss={() => setShowToast({ show: false, points: 0 })}
        message={`¡Excelente! Ganaste ${showToast.points} puntos al volver.`}
        duration={3000}
        color="dark"
        position="top"
        icon={checkmarkCircle}
      />
    </div>
  );
};

export default TaskList;