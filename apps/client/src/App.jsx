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
import SupportPage from './components/SupportPage';
import PropuestaDetalle from './components/PropuestaDetalle';

/* CSS de Ionic */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

setupIonicReact({ mode: 'ios' });

let isOneSignalInitialized = false;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    // 1. Inicializar OneSignal (Solo intentará en navegadores compatibles)
    const initOneSignal = async () => {
      if (isOneSignalInitialized) return;
      try {
        await OneSignal.init({
          appId: "adba165e-1f2c-402a-9a3b-16bfd706b4a2",
          allowLocalhostAsSecureOrigin: true,
        });
        isOneSignalInitialized = true;
      } catch (e) {
        console.warn("OneSignal no disponible o ya inicializado");
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
          {/* Ruta para la Landing Page (Accesible para todos en /welcome) */}
          <Route exact path="/welcome" component={LandingPage} />

          {/* Login: Si ya está autenticado, va al home */}
          <Route exact path="/login">
            {isAuthenticated ? <Redirect to="/home" /> : <LoginPage onLogin={() => setIsAuthenticated(true)} />}
          </Route>

          {/* Rutas Protegidas */}
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
            {!isAuthenticated ? <Redirect to="/login" /> : <ShopPage />}
          </Route>
		  
		  {/* Ruta de Soporte / Aporte Voluntario */}
		  <Route exact path="/support">
			{!isAuthenticated ? <Redirect to="/login" /> : <SupportPage />}
		  </Route>

          {/* Redirección inicial: 
              Si no está logueado, lo enviamos al login (o a /welcome si prefieres) */}
          <Route exact path="/">
            <Redirect to={isAuthenticated ? "/home" : "/login"} />
          </Route>
		  
		  <Route exact path="/propuesta/:id" component={PropuestaDetalle} />

          {/* Fallback */}
          <Route render={() => <Redirect to="/" />} />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
}

export default App;