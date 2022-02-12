import Amplify from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';

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
import { calendar, map, menu, person } from 'ionicons/icons';

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

import { AuthFooter, AuthHeader } from './components/Auth';
import AgendaPage from './pages/Agenda';
import MapPage from './pages/Map';
import ProfilePage from './pages/Profile';
import MenuPage from './pages/Menu';
import SessionPage from './pages/Session';
import VenuePage from './pages/Venue';
import SpeakersPage from './pages/Speakers';
import SpeakerPage from './pages/Speaker';
import OrganizationsPage from './pages/Organizations';
import OrganizationPage from './pages/Organization';

import { isMobileMode } from './utils';

import 'typeface-poppins';
import './theme/variables.css';
import './theme/theme.css';

import { environment as env } from './environment';

setupIonicReact();

Amplify.configure({
  Auth: {
    region: env.cognito.region,
    userPoolId: env.cognito.userPoolId,
    userPoolWebClientId: env.cognito.clientId,
    identityPoolId: env.cognito.identityPoolId
  },
  geo: {
    AmazonLocationService: {
      maps: { items: { [env.geo.mapName]: { style: env.geo.mapStyle } }, default: env.geo.mapName },
      region: env.geo.region
    }
  }
});

const App: React.FC = () => (
  <Authenticator components={{ Header: AuthHeader, Footer: AuthFooter }}>
    {({ user }) =>
      !user ? (
        <></>
      ) : (
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
                <Route path="/organizations">
                  <OrganizationsPage />
                </Route>
                <Route path="/organization/:organizationId">
                  <OrganizationPage />
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
      )
    }
  </Authenticator>
);

export default App;
