import { Amplify } from 'aws-amplify';
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

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
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

/* Theme variables */
import './theme/variables.css';

import { calendar, map, person } from 'ionicons/icons';
import Agenda from './pages/Agenda';
import Map from './pages/Map';
import Profile from './pages/Profile';

setupIonicReact();
awsConfig.aws_appsync_authenticationType = 'API_KEY'; // @temp prior authentication
Amplify.configure(awsConfig);

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>
          <Route exact path="/agenda">
            <Agenda />
          </Route>
          <Route exact path="/map">
            <Map />
          </Route>
          <Route path="/profile">
            <Profile />
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

export default App;
