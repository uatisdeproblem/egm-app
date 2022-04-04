import { Auth } from '@aws-amplify/auth';
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemDivider,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonAlert
} from '@ionic/react';
import {
  business,
  businessOutline,
  calendar,
  calendarOutline,
  helpBuoy,
  informationCircle,
  logOut,
  map,
  mapOutline,
  megaphone,
  megaphoneOutline,
  mic,
  micOutline,
  people,
  prismOutline,
  refresh,
  ribbonOutline
} from 'ionicons/icons';
import { useEffect, useState } from 'react';

import { isMobileMode } from '../utils';
import { isUserAdmin } from '../utils/data';
import { getEnv } from '../environment';

const MenuPage: React.FC = () => {
  const [showAlert] = useIonAlert();

  const [userIsAdmin, setUserIsAdmin] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setUserIsAdmin(await isUserAdmin());
    };
    loadData();
  }, []);

  const showAppInfo = async (): Promise<void> => {
    const header = 'App version';
    const message = `v${getEnv().version}`;
    const buttons = ['Got it'];
    await showAlert({ header, message, buttons });
  };
  const logout = async (): Promise<void> => {
    const header = 'Logout';
    const message = 'Are you sure?';
    const doLogout = async (): Promise<void> => {
      await Auth.signOut();
      // fix known Cognito bug (QuotaExceededError): https://github.com/aws-amplify/amplify-js/issues/9140
      window.localStorage.clear();
      reloadApp();
    };
    const buttons = ['Cancel', { text: 'Confirm', handler: doLogout }];
    await showAlert({ header, message, buttons });
  };
  const reloadApp = () => window.location.assign('');

  const openEmailComposerForFeedback = () => `mailto:${getEnv().supportEmail}?subject=EGM app`;

  return (
    <IonPage>
      <IonHeader>
        {isMobileMode() ? (
          <IonToolbar color="ideaToolbar">
            <IonTitle>Menu</IonTitle>
          </IonToolbar>
        ) : (
          ''
        )}
      </IonHeader>
      <IonContent>
        <IonList style={{ maxWidth: 500, margin: '0 auto', paddingBottom: 40 }}>
          <IonItemDivider>
            <IonLabel>Pages</IonLabel>
          </IonItemDivider>
          <IonItem button color="white" routerLink="/communications">
            <IonIcon icon={megaphone} slot="start"></IonIcon>
            <IonLabel>News & communications</IonLabel>
          </IonItem>
          <IonItem button color="white" routerLink="/sessions">
            <IonIcon icon={calendar} slot="start"></IonIcon>
            <IonLabel>Agenda</IonLabel>
          </IonItem>
          <IonItem button color="white" routerLink="/venues">
            <IonIcon icon={map} slot="start"></IonIcon>
            <IonLabel>Venues</IonLabel>
          </IonItem>
          <IonItem button color="white" routerLink="/organizations">
            <IonIcon icon={business} slot="start"></IonIcon>
            <IonLabel>Organizations</IonLabel>
          </IonItem>
          <IonItem button color="white" routerLink="/speakers">
            <IonIcon icon={mic} slot="start"></IonIcon>
            <IonLabel>Speakers</IonLabel>
          </IonItem>
          <IonItem button color="white" routerLink="/user">
            <IonIcon icon={people} slot="start"></IonIcon>
            <IonLabel>Profile and connections</IonLabel>
          </IonItem>
          {userIsAdmin ? (
            <>
              <IonItemDivider>
                <IonLabel>Manage</IonLabel>
              </IonItemDivider>
              <IonItem button color="white" routerLink="/manage/communication/new">
                <IonIcon icon={megaphoneOutline} slot="start"></IonIcon>
                <IonLabel>Add communication</IonLabel>
              </IonItem>
              <IonItem button color="white" routerLink="/manage/session/new">
                <IonIcon icon={calendarOutline} slot="start"></IonIcon>
                <IonLabel>Add session</IonLabel>
              </IonItem>
              <IonItem button color="white" routerLink="/manage/venue/new">
                <IonIcon icon={mapOutline} slot="start"></IonIcon>
                <IonLabel>Add venue</IonLabel>
              </IonItem>
              <IonItem button color="white" routerLink="/manage/room/new">
                <IonIcon icon={prismOutline} slot="start"></IonIcon>
                <IonLabel>Add room</IonLabel>
              </IonItem>
              <IonItem button color="white" routerLink="/manage/organization/new">
                <IonIcon icon={businessOutline} slot="start"></IonIcon>
                <IonLabel>Add organization</IonLabel>
              </IonItem>
              <IonItem button color="white" routerLink="/manage/speaker/new">
                <IonIcon icon={micOutline} slot="start"></IonIcon>
                <IonLabel>Add speaker</IonLabel>
              </IonItem>
              <IonItem button color="white" routerLink="/admins">
                <IonIcon icon={ribbonOutline} slot="start"></IonIcon>
                <IonLabel>Manage administrators</IonLabel>
              </IonItem>
            </>
          ) : (
            ''
          )}
          <IonItemDivider>
            <IonLabel>Other actions</IonLabel>
          </IonItemDivider>
          <IonItem button color="white" onClick={reloadApp}>
            <IonIcon icon={refresh} slot="start"></IonIcon>
            <IonLabel>Reload app</IonLabel>
          </IonItem>
          <IonItem button color="white" onClick={showAppInfo}>
            <IonIcon icon={informationCircle} slot="start"></IonIcon>
            <IonLabel>App information</IonLabel>
          </IonItem>
          <IonItem button color="white" href={openEmailComposerForFeedback()} target="_blank">
            <IonIcon icon={helpBuoy} slot="start"></IonIcon>
            <IonLabel>Feedback/ask for help</IonLabel>
          </IonItem>
          <IonItem button color="white" onClick={logout}>
            <IonIcon icon={logOut} slot="start"></IonIcon>
            <IonLabel>Sign-out</IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default MenuPage;
