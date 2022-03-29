import { Amplify, Hub } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';

import { useState } from 'react';
import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonBadge,
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
import { calendar, map, megaphone, menu, people } from 'ionicons/icons';

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
import MenuPage from './pages/Menu';
import UserPage from './pages/User';
import SessionsPage from './pages/Sessions';
import SessionPage from './pages/Session';
import VenuesPage from './pages/Venues';
import VenuePage from './pages/Venue';
import RoomPage from './pages/Room';
import SpeakersPage from './pages/Speakers';
import SpeakerPage from './pages/Speaker';
import OrganizationsPage from './pages/Organizations';
import OrganizationPage from './pages/Organization';
import CommunicationsPage from './pages/Communications';
import CommunicationPage from './pages/Communication';
import ManageEntityPage from './pages/ManageEntity';
import AddToHomeScreenSuggestion from './components/AddToHomeScreenSuggestion';

import { isMobileMode } from './utils';

import 'typeface-poppins';
import './theme/variables.css';
import './theme/theme.css';

import { getEnv } from './environment';
const env = getEnv();

setupIonicReact({ mode: 'md' });

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

Amplify.I18n.setLanguage('en');
Amplify.I18n.putVocabularies({ en: { Username: 'Email' } });

const App: React.FC = () => {
  const [communicationsCounter, setCommunicationsCounter] = useState(0);

  Hub.listen('communications', ({ payload }) => setCommunicationsCounter(payload.data.num || 0));

  return (
    <IonApp>
      <AddToHomeScreenSuggestion></AddToHomeScreenSuggestion>
      <Authenticator components={{ Header: AuthHeader, Footer: AuthFooter }}>
        {({ user }) =>
          !user ? (
            <></>
          ) : (
            <IonReactRouter>
              <IonTabs>
                <IonRouterOutlet>
                  <Route path="/user">
                    <UserPage />
                  </Route>
                  <Route path="/menu">
                    <MenuPage />
                  </Route>
                  <Route path="/sessions">
                    <SessionsPage />
                  </Route>
                  <Route path="/session/:sessionId">
                    <SessionPage />
                  </Route>
                  <Route path="/communications">
                    <CommunicationsPage />
                  </Route>
                  <Route path="/communication/:communicationId">
                    <CommunicationPage />
                  </Route>
                  <Route path="/venues">
                    <VenuesPage />
                  </Route>
                  <Route path="/venue/:venueId">
                    <VenuePage />
                  </Route>
                  <Route path="/room/:roomId">
                    <RoomPage />
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
                  <Route path="/manage/:type/:id">
                    <ManageEntityPage />
                  </Route>
                  <Route exact path="/">
                    <Redirect to="/communications" />
                  </Route>
                </IonRouterOutlet>
                <IonTabBar
                  color="ideaToolbar"
                  mode={isMobileMode() ? 'md' : 'ios'}
                  slot={isMobileMode() ? 'bottom' : 'top'}
                  style={isMobileMode() ? {} : { justifyContent: 'right', borderBottom: 'none' }}
                >
                  <IonTabButton tab="communications" href="/communications">
                    {isMobileMode() ? <IonIcon icon={megaphone} /> : ''}
                    <IonLabel>News</IonLabel>
                    {communicationsCounter > 0 ? (
                      <IonBadge color="ESNcyan" style={{ marginLeft: 8, fontWeight: 'bold' }}>
                        {communicationsCounter}
                      </IonBadge>
                    ) : (
                      ''
                    )}
                  </IonTabButton>
                  <IonTabButton tab="sessions" href="/sessions">
                    {isMobileMode() ? <IonIcon icon={calendar} /> : ''}
                    <IonLabel>Agenda</IonLabel>
                  </IonTabButton>
                  <IonTabButton tab="venues" href="/venues">
                    {isMobileMode() ? <IonIcon icon={map} /> : ''}
                    <IonLabel>Venues</IonLabel>
                  </IonTabButton>
                  <IonTabButton tab="user" href="/user">
                    {isMobileMode() ? <IonIcon icon={people} /> : ''}
                    <IonLabel>You</IonLabel>
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
          )
        }
      </Authenticator>
    </IonApp>
  );
};

export default App;
