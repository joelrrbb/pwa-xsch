import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import { Autoplay, Pagination } from 'swiper/modules';
import { supabase } from '../supabaseClient'; // Ajusta la ruta

const EventSwiper = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div style={{
        height: '180px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <span>Cargando eventos...</span>
      </div>
    );
  }

  if (!events.length) return null;

  return (
    <div style={{ marginBottom: '20px', marginTop:'10px' }}>
      {/* Encabezado personalizado */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px', // espacio entre imagen y texto
        marginBottom: '16px'
      }}>
        <img 
          src="/xsch-1.svg" 
          alt="Eventos" 
          style={{ width: '40px', height: '40px' }}
        />
        <div>
          <div className="ys-text">Actividades</div>
          <div style={{ fontSize: '0.9rem', color: '#555' }}>Próximos eventos y reuniones</div>
        </div>
      </div>
	<style>
        {`
          .swiper-pagination-bullet {
            background: black !important;
          }
        `}
      </style>
      <Swiper
        pagination={true} 
        modules={[Autoplay, Pagination]}
        loop={true}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
		style={{ borderRadius: '20px', overflow: 'hidden' }}
      >
        {events.map(event => (
          <SwiperSlide key={event.id}>
            {event.redirect_link ? (
              <a 
                href={event.redirect_link} 
                target={event.is_blank ? "_blank" : "_self"} 
                rel="noopener noreferrer"
              >
                <img
                  src={event.image_link}
                  alt={event.name}
                  loading="lazy"
                  style={styles.bannerImage}
                />
              </a>
            ) : (
              <img
                src={event.image_link}
                alt={event.name}
                style={styles.bannerImage}
              />
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

const styles = {
  bannerImage: {
    width: '100%',
    height: '120px',
    objectFit: 'cover',
    borderRadius: '20px',
    display: 'block'
  }
};

export default EventSwiper;
