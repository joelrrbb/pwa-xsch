import { useState, useEffect } from 'react';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Redirect } from 'react-router-dom';
import OneSignal from 'react-onesignal';

// Importa tus componentes
import HomePage from './components/HomePage';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import ReferidosPage from './components/ReferidosPage';
import DonationPage from './components/DonationPage';
import DownloadsPage from './components/DownloadsPage';
import ShopPage from './components/ShopPage';

/* CSS de Ionic */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

setupIonicReact({ mode: 'ios' });

// Variable global para evitar reinicializaciones molestas en desarrollo
let isOneSignalInitialized = false;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    // 1. Inicializar OneSignal
    const initOneSignal = async () => {
      if (isOneSignalInitialized) return;
      try {
        await OneSignal.init({
          appId: "adba165e-1f2c-402a-9a3b-16bfd706b4a2",
          allowLocalhostAsSecureOrigin: true,
        });
        isOneSignalInitialized = true;
      } catch (e) {
        isOneSignalInitialized = true;
      }
    };
    initOneSignal();

    // 2. Verificar Sesión
    const session = localStorage.getItem('user_session');
    setIsAuthenticated(!!session);
  }, []);

  if (isAuthenticated === null) return null;

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          
          {/* --- TODAS LAS RUTAS SON ACCESIBLES --- */}
          
          <Route exact path="/home" component={HomePage} />
          <Route exact path="/referidos" component={ReferidosPage} />
          <Route exact path="/donation" component={DonationPage} />
          <Route exact path="/downloads" component={DownloadsPage} />
          <Route exact path="/shop" component={ShopPage} />
          
          <Route exact path="/login">
            <LoginPage onLogin={() => setIsAuthenticated(true)} />
          </Route>

          {/* --- REDIRECCIÓN INICIAL --- */}
          <Route exact path="/">
            {/* Si quieres que siempre entre a Home aunque no esté logueado, 
                cambia el Redirect directamente a "/home" */}
            <Redirect to={isAuthenticated ? "/home" : "/login"} />
          </Route>

          {/* Fallback para cualquier otra ruta */}
          <Route render={() => <Redirect to="/home" />} />
          
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
}

export default App;