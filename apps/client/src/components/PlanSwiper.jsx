import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { IonRouterLink, IonSpinner } from '@ionic/react';
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
          .from('planes')
          .select('*')
          .eq('is_active', true)
          .order('priority', { ascending: true });

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

  // Si no hay planes y ya cargó, no mostramos nada
  if (!loading && !planes.length) return null;

  return (
    <div style={{ marginBottom: '25px', marginTop: '10px' }}>
      {/* Encabezado del Swiper: SIEMPRE VISIBLE */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', paddingLeft: '5px' }}>
        <img src="/xsch-1.svg" alt="Logo" style={{ width: '40px', height: '40px' }} />
        <div>
          <div className="ys-text">Propuestas</div>
          <div style={{ fontSize: '.85rem', color: '#64748b' }}>Proyectos que vienen a cambiarlo todo.</div>
        </div>
      </div>

      <style>
        {`
			.plan-swiper .swiper-pagination-bullet {
				width: 6px;
				height: 6px;
			}
          .plan-swiper .swiper-pagination-bullet-active {
            background: #fff !important;
            width: 12px;
            border-radius: 4px;
            transition: all 0.3s ease;
          }
        `}
      </style>

      {/* Solo mostramos el Spinner o el Swiper aquí abajo */}
      {loading ? (
        <div style={{ 
          height: '140px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: '#f8fafc',
          borderRadius: '20px' 
        }}>
          <IonSpinner name="crescent" color="primary" />
        </div>
      ) : (
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
              <IonRouterLink
                routerLink={`/propuesta/${plan.id}`}
                routerDirection="forward"
                style={{ display: 'block', textDecoration: 'none' }}
              >
                <div style={{ position: 'relative', height: '140px' }}>
                  <img
                    src={plan.url_image_swiper}
                    alt={plan.title}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                  
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '60%',
                    background: 'linear-gradient(transparent, rgba(57, 255, 20, 0.4))',
                    display: 'flex',
                    alignItems: 'flex-end',
                    padding: '15px'
                  }}>
                    {/* Aquí podrías renderizar plan.title si lo deseas */}
                  </div>
                </div>
              </IonRouterLink>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
};

export default PlanSwiper;