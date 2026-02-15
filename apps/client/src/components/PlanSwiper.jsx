import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { IonRouterLink, IonSpinner, IonText } from '@ionic/react';
import { Autoplay, Pagination } from 'swiper/modules';

// Estilos de Swiper
import 'swiper/css';
import 'swiper/css/pagination';

import { supabase } from '../supabaseClient';

const PlanSwiper = () => {
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlanes = async () => {
      try {
        const { data, error } = await supabase
          .from('planes') // Cambiado a tu nueva tabla
          .select('*')
          .eq('is_active', true) // Filtramos solo los activos
          .order('priority', { ascending: true }); // Orden por prioridad

        if (error) throw error;
        if (data) setPlanes(data);
      } catch (err) {
        console.error('Error fetching planes:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPlanes();
  }, []);

  if (loading) {
    return (
      <div className="ion-text-center ion-padding" style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <IonSpinner name="crescent" color="primary" />
      </div>
    );
  }

  if (!planes.length) return null;

  return (
    <div style={{ marginBottom: '25px', marginTop: '10px' }}>
      {/* Encabezado del Swiper */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', paddingLeft: '5px' }}>
        <img src="/xsch-1.svg" alt="Logo" style={{ width: '40px', height: '40px' }} />
        <div>
          <div className="ys-text">Plan Chuquisaca</div>
          <div style={{ fontSize: '.85rem', color: '#64748b' }}>Acción inmediata, visión a largo plazo.</div>
        </div>
      </div>

      <style>
        {`
          .plan-swiper .swiper-pagination-bullet-active {
            background: #000 !important;
            width: 16px;
            border-radius: 4px;
            transition: all 0.3s ease;
          }
        `}
      </style>

      <Swiper
        className="plan-swiper"
        pagination={{ clickable: true }}
        modules={[Autoplay, Pagination]}
        loop={planes.length > 1}
        autoplay={{ delay: 4500, disableOnInteraction: false }}
        style={{ borderRadius: '20px', overflow: 'hidden', boxShadow: '0 8px 20px rgba(0,0,0,0.06)' }}
      >
        {planes.map((plan) => (
          <SwiperSlide key={plan.id}>
            {/* Navegamos a una ruta de detalle pasando el ID */}
            <IonRouterLink
              routerLink={`/propuesta/${plan.id}`}
              routerDirection="forward"
              style={{ display: 'block', textDecoration: 'none' }}
            >
              <div style={{ position: 'relative', height: '150px' }}>
                <img
                  src={plan.url_image_swiper} // Nuevo campo
                  alt={plan.title}
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
                
                {/* Gradiente sutil para que el título sea legible */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '60%',
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.5))',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '15px'
                }}>
                  <IonText className='ys-text-sm' style={{ color: 'white', fontWeight: '700', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                    {plan.title}
                  </IonText>
                </div>
              </div>
            </IonRouterLink>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default PlanSwiper;