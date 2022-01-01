import { Amplify } from 'aws-amplify';
import { useAuthenticator } from '@aws-amplify/ui-react';
import awsConfig from './aws-exports';

import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

import AuthPage from './pages/Auth';
import AgendaPage from './pages/Agenda';
import MapPage from './pages/Map';
import ProfilePage from './pages/Profile';

import { calendar, map, person } from 'ionicons/icons';

import './theme/variables.css';
import './theme/theme.css';

setupIonicReact();
Amplify.configure(awsConfig);

const App: React.FC = () => {
  const { user } = useAuthenticator();

  if (!user) return <AuthPage />;
  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/agenda">
              <AgendaPage />
            </Route>
            <Route exact path="/map">
              <MapPage />
            </Route>
            <Route path="/profile">
              <ProfilePage />
            </Route>
            <Route exact path="/">
              <Redirect to="/agenda" />
            </Route>
          </IonRouterOutlet>
          <IonTabBar slot="bottom">
            <IonTabButton tab="agenda" href="/agenda">
              <IonIcon icon={calendar} />
              <IonLabel>Agenda</IonLabel>
            </IonTabButton>
            <IonTabButton tab="map" href="/map">
              <IonIcon icon={map} />
              <IonLabel>Map</IonLabel>
            </IonTabButton>
            <IonTabButton tab="profile" href="/profile">
              <IonIcon icon={person} />
              <IonLabel>Profile</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
