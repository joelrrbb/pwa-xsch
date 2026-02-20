import React from 'react';
import { IonModal, IonIcon, IonRouterLink } from '@ionic/react';
import { closeCircleOutline } from 'ionicons/icons';

/**
 * ImgModal - Componente de Imagen Pura Reutilizable
 * @param {boolean} isOpen - Controla la visibilidad
 * @param {function} onClose - Función de cierre
 * @param {string} imageSrc - URL de la imagen completa del modal
 * @param {string} targetRoute - Ruta dinámica para el redireccionamiento
 */
const ImgModal = ({ isOpen, onClose, imageSrc, targetRoute = "#" }) => {
  return (
    <>
      <style>{`
        /* Configuración del Modal Transparente */
        .img-pure-modal {
          --background: transparent;
          --width: 100%;
          --height: 100%;
          --border-radius: 0;
        }

        .img-pure-modal::part(content) {
          background: transparent;
          box-shadow: none;
        }

        /* Máscara de fondo */
        .pure-pop-mask {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }

        /* Contenedor de la imagen y cierre */
        .pure-pop-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 85%;
          max-width: 400px;
          animation: purePopIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        /* Enlace que envuelve la imagen */
        .pure-img-link {
          width: 100%;
          line-height: 0;
          display: block;
          filter: drop-shadow(0 20px 40px rgba(0,0,0,0.5));
          transition: transform 0.1s ease;
        }

        .pure-img-link:active {
          transform: scale(0.97);
        }

        /* La imagen en sí */
        .pure-img-content {
          width: 100%;
          height: auto;
          display: block;
          /* Si la imagen no trae borde blanco, puedes activarlo aquí:
             border: 4px solid white; 
             border-radius: 20px; 
          */
        }

        /* Botón de cierre */
        .pure-close-btn {
          margin-top: 25px;
          background: transparent;
          border: none;
          color: white;
          font-size: 35px;
          cursor: pointer;
          opacity: 0.8;
          display: flex;
          align-items: center;
          justify-content: center;
          filter: drop-shadow(0 2px 8px rgba(0,0,0,0.4));
        }

        @keyframes purePopIn {
          from { opacity: 0; transform: scale(0.6); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <IonModal 
        isOpen={isOpen} 
        onDidDismiss={onClose}
        className="img-pure-modal"
      >
        <div className="pure-pop-mask">
          <div className="pure-pop-wrapper">
            
            {/* Imagen dinámica como único elemento interactivo */}
            <IonRouterLink 
              routerLink={targetRoute} 
              onClick={onClose}
              className="pure-img-link"
            >
              <img 
                className="pure-img-content" 
                src={imageSrc} 
                alt="Modal Promotion"
              />
            </IonRouterLink>

            {/* Cierre independiente */}
            <button className="pure-close-btn" onClick={onClose}>
              <IonIcon icon={closeCircleOutline} />
            </button>
            
          </div>
        </div>
      </IonModal>
    </>
  );
};

export default ImgModal;