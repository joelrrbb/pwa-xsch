import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useHistory } from 'react-router-dom'; 
import 'swiper/css';
import 'swiper/css/pagination';
import { Autoplay, Pagination } from 'swiper/modules';
import { supabase } from '../supabaseClient';

const EventSwiper = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('id, name, image_link, redirect_link, is_blank')
          .eq('is_delete', false)
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) setEvents(data);
      } catch (err) {
        console.error('Error fetching events:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Lógica basada puramente en is_blank
  const handleNavigation = (link, isBlank) => {
    if (!link) return;

    if (isBlank) {
      // Caso: Link externo (Pestaña nueva)
      window.open(link, '_blank', 'noopener,noreferrer');
    } else {
      // Caso: Navegación interna (SPA)
      // Aseguramos que el link empiece con / para el router
      const internalPath = link.startsWith('/') ? link : `/${link}`;
      history.push(internalPath);
    }
  };

  if (loading) return <div className="ion-padding text-center">Cargando...</div>;
  if (!events.length) return null;

  return (
    <div style={{ marginBottom: '20px', marginTop: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <img src="/xsch-1.svg" alt="Actividades" style={{ width: '40px', height: '40px' }} />
        <div>
          <div className="ys-text">Actividades</div>
          <div style={{ fontSize: '0.85rem', color: '#666' }}>Próximos eventos y reuniones</div>
        </div>
      </div>

      <style>
        {`.swiper-pagination-bullet-active { background: #000 !important; }`}
      </style>

      <Swiper
        pagination={{ clickable: true }}
        modules={[Autoplay, Pagination]}
        loop={events.length > 1}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        style={{ borderRadius: '20px', overflow: 'hidden' }}
      >
        {events.map(event => (
          <SwiperSlide key={event.id}>
            <div 
              onClick={() => handleNavigation(event.redirect_link, event.is_blank)}
              style={{ cursor: 'pointer' }}
            >
              <img
                src={event.image_link}
                alt={event.name}
                loading="lazy"
                style={{
                  width: '100%',
                  height: '140px', // Ajusté un poco el alto para que luzca mejor
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default EventSwiper;