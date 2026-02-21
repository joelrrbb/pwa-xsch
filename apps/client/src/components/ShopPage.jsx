import React, { useEffect, useState } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonGrid, IonRow, IonCol, IonCard, IonCardContent,
  IonButton, IonIcon, IonButtons, IonBackButton, IonFooter,
  IonBadge, IonText, IonSpinner
} from '@ionic/react';
import { bagHandleOutline, logoWhatsapp, removeCircleOutline, addOutline, chevronBackOutline } from 'ionicons/icons';
import { supabase } from '../supabaseClient';

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [whatsapp, setWhatsapp] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Cargar Datos desde Supabase (Productos y Configuración)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Traer productos de la tabla 'products'
        const { data: prodData, error: prodError } = await supabase
          .from('products')
          .select('*')
          .order('id', { ascending: true });

        // Traer config de WhatsApp
        const { data: confData } = await supabase
          .from('system_conf')
          .select('shop_whatsapp')
          .single();

        if (prodError) throw prodError;
        if (prodData) setProducts(prodData);
        if (confData) setWhatsapp(confData.shop_whatsapp.replace(/\D/g, ''));
        
      } catch (err) {
        console.error("Error cargando datos:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🔹 Lógica del Carrito
  const addToCart = (product) => setCartItems((prev) => [...prev, product]);

  const removeFromCart = (productId) => {
    setCartItems((prev) => {
      const index = prev.findLastIndex(item => item.id === productId);
      if (index > -1) {
        const newCart = [...prev];
        newCart.splice(index, 1);
        return newCart;
      }
      return prev;
    });
  };

  const getQuantity = (id) => cartItems.filter(item => item.id === id).length;
  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  // 🔹 Lógica de Envío WhatsApp
  const sendWhatsApp = () => {
    if (!whatsapp || cartItems.length === 0) return;

    const resumen = cartItems.reduce((acc, item) => {
      acc[item.title] = (acc[item.title] || 0) + 1;
      return acc;
    }, {});

    let pedidoTexto = Object.keys(resumen)
      .map(name => `*${resumen[name]}x* ${name}`)
      .join('\n');

    const message = `*📦 NUEVO PEDIDO*\n\n${pedidoTexto}\n\n*Total a pagar: Bs.${total}*`;
    const url = `https://api.whatsapp.com/send?phone=591${whatsapp}&text=${encodeURIComponent(message)}`;
    window.location.assign(url);
  };

  return (
    <IonPage>
      <style>{`
        .product-card { border-radius: 22px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); background: #fff; border: 1px solid #f2f2f2; }
        .product-img { width: 100%; height: 140px; object-fit: cover; }
        .product-label { margin: 0; font-size: 0.8rem; font-weight: 500; color: #888; }
        .product-price { margin: 2px 0 14px 0; font-size: 1.4rem; font-weight: 800; color: #000; }
        .counter-container { display: flex; align-items: center; justify-content: space-between; background: #f4f5f8; border-radius: 12px; height: 38px; }
        .footer-white { background: #fff; padding: 10px 5px 20px 5px; border-top: 1px solid #eee; }
        .footer-total { margin: 0; font-weight: 900; font-size: 1.6rem; color: #1a1a1a; }
        .whatsapp-btn-modern { --background: #25D366; --border-radius: 18px; height: 56px; font-weight: 800; --box-shadow: 0 8px 20px rgba(37, 211, 102, 0.25); margin: 0; }
        .badge-custom { background: rgba(255,255,255,0.3); color: white; padding: 4px 10px; border-radius: 10px; margin-left: 10px; font-size: 0.9rem; backdrop-filter: blur(4px); }
      `}</style>

      <IonHeader className="ion-no-border">
        <IonToolbar mode="ios">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" icon={chevronBackOutline} text="Atrás" mode="ios" />
          </IonButtons>
          <IonTitle className="ys-text">Catálogo</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent color="light">
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px' }}>
            <IonSpinner name="crescent" color="dark" />
            <p style={{ color: '#888' }}>Cargando catálogo...</p>
          </div>
        ) : (
          <IonGrid style={{ padding: '12px' }}>
            <IonRow>
              {products.map((product) => (
                <IonCol size="6" key={product.id} style={{ padding: '8px' }}>
                  <IonCard mode="ios" className="product-card ion-no-margin">
                    <img src={product.image} alt={product.title} className="product-img" />
                    
                    <IonCardContent style={{ padding: '12px' }}>
                      <IonText color="dark">
                        <p className="product-label">{product.title}</p>
                        <p className="product-price">Bs. {product.price}</p>
                      </IonText>

                      {getQuantity(product.id) > 0 ? (
                        <div className="counter-container">
                          <IonButton fill="clear" color="dark" onClick={() => removeFromCart(product.id)}>
                            <IonIcon icon={removeCircleOutline} />
                          </IonButton>
                          <IonText><b>{getQuantity(product.id)}</b></IonText>
                          <IonButton fill="clear" color="dark" onClick={() => addToCart(product)}>
                            <IonIcon icon={addOutline} />
                          </IonButton>
                        </div>
                      ) : (
                        <IonButton
                          expand="block" fill="solid" color="dark" mode="ios" size="small"
                          style={{ '--border-radius': '12px', height: '38px', fontWeight: '700', fontSize:'1rem' }}
                          onClick={() => addToCart(product)}
                        >
                          Añadir
                        </IonButton>
                      )}
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
        )}
      </IonContent>

      <IonFooter className="ion-no-border footer-white">
        <IonGrid>
          <IonRow className="ion-align-items-center ion-padding-horizontal">
            <IonCol size="4">
              <IonText color="medium" style={{ fontSize: '10px', letterSpacing: '1px', marginLeft:'15px' }}>TOTAL</IonText>
              <h2 style={{marginLeft:'15px' }} className="footer-total">${total}</h2>
            </IonCol>
            <IonCol size="8">
              <IonButton
                expand="block" color="success" mode="ios"
                className="whatsapp-btn-modern"
                onClick={sendWhatsApp}
                disabled={cartItems.length === 0 || !whatsapp}
              >
                <IonIcon slot="start" icon={logoWhatsapp} style={{ fontSize: '24px', marginRight:'5px' }} />
                <span>Enviar Pedido</span>
                <div className="badge-custom">{cartItems.length}</div>
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonFooter>
    </IonPage>
  );
};

export default ShopPage;