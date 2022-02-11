import { Amplify } from 'aws-amplify';
import { Storage } from '@aws-amplify/storage';
import { useAuthenticator } from '@aws-amplify/ui-react';
import awsConfig from './aws-exports';

import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonImg,
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
import MenuPage from './pages/Menu';
import SessionPage from './pages/Session';
import VenuePage from './pages/Venue';
import SpeakersPage from './pages/Speakers';
import SpeakerPage from './pages/Speaker';

import { isMobileMode } from './utils';

import { calendar, map, menu, person } from 'ionicons/icons';

import 'typeface-poppins';
import './theme/variables.css';
import './theme/theme.css';

setupIonicReact();
Amplify.configure(awsConfig);
Storage.configure({ level: 'private' });

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
            <Route path="/menu">
              <MenuPage />
            </Route>
            <Route path="/session/:sessionId">
              <SessionPage />
            </Route>
            <Route path="/venue/:venueId">
              <VenuePage />
            </Route>
            <Route path="/speakers">
              <SpeakersPage />
            </Route>
            <Route path="/speaker/:speakerId">
              <SpeakerPage />
            </Route>
            <Route exact path="/">
              <Redirect to="/agenda" />
            </Route>
          </IonRouterOutlet>
          <IonTabBar
            color="ideaToolbar"
            mode={isMobileMode() ? 'md' : 'ios'}
            slot={isMobileMode() ? 'bottom' : 'top'}
            style={isMobileMode() ? {} : { justifyContent: 'right', borderBottom: 'none' }}
          >
            <IonTabButton tab="agenda" href="/agenda">
              {isMobileMode() ? <IonIcon icon={calendar} /> : ''}
              <IonLabel>Agenda</IonLabel>
            </IonTabButton>
            <IonTabButton tab="map" href="/map">
              {isMobileMode() ? <IonIcon icon={map} /> : ''}
              <IonLabel>Map</IonLabel>
            </IonTabButton>
            <IonTabButton tab="profile" href="/profile">
              {isMobileMode() ? <IonIcon icon={person} /> : ''}
              <IonLabel>Profile</IonLabel>
            </IonTabButton>
            <IonTabButton tab="menu" href="/menu">
              {isMobileMode() ? <IonIcon icon={menu} /> : ''}
              <IonLabel>Menu</IonLabel>
            </IonTabButton>
            {isMobileMode() ? (
              ''
            ) : (
              <IonTabButton>
                <IonImg src="/assets/images/ESN-star-full-colour.png" style={{ height: 25 }}></IonImg>
              </IonTabButton>
            )}
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
