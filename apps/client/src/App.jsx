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
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    // 1. Detección de PWA (JS puro)
    const checkPWA = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
                           || window.navigator.standalone 
                           || document.referrer.includes('android-app://');
      setIsPWA(!!isStandalone);
    };

    checkPWA();

    // 2. Inicializar OneSignal
    const initOneSignal = async () => {
      if (isOneSignalInitialized) return;
      try {
        await OneSignal.init({
          appId: "adba165e-1f2c-402a-9a3b-16bfd706b4a2",
          allowLocalhostAsSecureOrigin: true,
        });
        isOneSignalInitialized = true;
        console.log("✅ OneSignal inicializado");
      } catch (e) {
        if (e.message && e.message.includes("already initialized")) {
          isOneSignalInitialized = true;
        } else {
          console.error("❌ Error OneSignal:", e);
        }
      }
    };

    initOneSignal();

    // 3. Verificar Sesión
    const session = localStorage.getItem('user_session');
    setIsAuthenticated(!!session);
  }, []);

  // Mientras verificamos la sesión, no mostramos nada para evitar parpadeos
  if (isAuthenticated === null) return null;

  // --- ESCENARIO 1: Navegador Web Normal ---
  if (!isPWA) {
    return (
      <IonApp>
        <LandingPage />
      </IonApp>
    );
  }

  // --- ESCENARIO 2: App Instalada (PWA) ---
  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          {/* Login: Si ya está autenticado, va al home */}
          <Route exact path="/login">
            {isAuthenticated ? <Redirect to="/home" /> : <LoginPage onLogin={() => setIsAuthenticated(true)} />}
          </Route>

          {/* Rutas Protegidas: Si no está autenticado, va al login */}
          <Route exact path="/home">
            {!isAuthenticated ? <Redirect to="/login" /> : <HomePage />}
          </Route>

          <Route exact path="/referidos">
            {!isAuthenticated ? <Redirect to="/login" /> : <ReferidosPage />}
          </Route>

          <Route exact path="/donation">
            {!isAuthenticated ? <Redirect to="/login" /> : <DonationPage />}
          </Route>

          <Route exact path="/downloads">
            {!isAuthenticated ? <Redirect to="/login" /> : <DownloadsPage />}
          </Route>

          <Route exact path="/shop">
			<ShopPage />
		  </Route>

          {/* Redirección inicial */}
          <Route exact path="/">
            <Redirect to={isAuthenticated ? "/home" : "/login"} />
          </Route>

          {/* Fallback para rutas no encontradas */}
          <Route render={() => <Redirect to="/" />} />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
}

export default App;