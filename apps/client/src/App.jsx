import { useState, useEffect } from 'react';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Redirect } from 'react-router-dom';
import OneSignal from 'react-onesignal';

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

// Variable fuera del componente para evitar re-init en StrictMode
let isOneSignalInitialized = false;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const initOneSignal = async () => {
      // Si ya se inicializó o está en proceso, salir
      if (isOneSignalInitialized) return;
      
      try {
        await OneSignal.init({
          appId: "adba165e-1f2c-402a-9a3b-16bfd706b4a2",
          allowLocalhostAsSecureOrigin: true,
        });
        isOneSignalInitialized = true;
        console.log("✅ OneSignal inicializado");
      } catch (e) {
        // Si el error es solo que ya estaba inicializado, marcamos como true
        if (e.message?.includes("already initialized")) {
          isOneSignalInitialized = true;
        } else {
          console.error("❌ Error inicializando OneSignal:", e);
        }
      }
    };

    initOneSignal();

    const session = localStorage.getItem('user_session');
    setIsAuthenticated(!!session);
  }, []);

  if (isAuthenticated === null) return null;

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path="/login">
            {isAuthenticated ? <Redirect to="/home" /> : <LoginPage onLogin={() => setIsAuthenticated(true)} />}
          </Route>
          <Route exact path="/home">
            {!isAuthenticated ? <Redirect to="/login" /> : <LandingPage />}
          </Route> 
		  
		  <Route exact path="/referidos" component={ReferidosPage} />
		  
		  <Route exact path="/donation" component={DonationPage} />
		  
		  <Route exact path="/downloads">
            {!isAuthenticated ? <Redirect to="/login" /> : <DownloadsPage />}
          </Route>
		  
		  <Route path="/shop" exact>
             {!isAuthenticated ? <Redirect to="/home" /> : <ShopPage />}
          </Route>
		  
          <Route exact path="/">
            <Redirect to={isAuthenticated ? "/home" : "/login"} />
          </Route>
          <Route render={() => <Redirect to="/" />} />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
}

export default App;