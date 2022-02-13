import Auth from '@aws-amplify/auth';
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
  calendar,
  informationCircle,
  logOut,
  map,
  mapOutline,
  people,
  person,
  refresh
} from 'ionicons/icons';
import { useEffect, useState } from 'react';

import { isMobileMode } from '../utils';
import { isUserAdmin } from '../utils/data';

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
    const message = 'v0.0.1';
    const buttons = ['Got it'];
    await showAlert({ header, message, buttons });
  };
  const logout = async (): Promise<void> => {
    const header = 'Logout';
    const message = 'Are you sure?';
    const doLogout = async (): Promise<void> => {
      await Auth.signOut();
      reloadApp();
    };
    const buttons = ['Cancel', { text: 'Confirm', handler: doLogout }];
    await showAlert({ header, message, buttons });
  };
  const reloadApp = () => window.location.assign('');

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
        <IonList style={{ maxWidth: 500, margin: '0 auto' }}>
          <IonItemDivider>
            <IonLabel>Pages</IonLabel>
          </IonItemDivider>
          <IonItem button color="white" routerLink="/agenda">
            <IonIcon icon={calendar} slot="start"></IonIcon>
            <IonLabel>Agenda</IonLabel>
          </IonItem>
          <IonItem button color="white" routerLink="/map">
            <IonIcon icon={map} slot="start"></IonIcon>
            <IonLabel>Map and venues</IonLabel>
          </IonItem>
          <IonItem button color="white" routerLink="/organizations">
            <IonIcon icon={business} slot="start"></IonIcon>
            <IonLabel>Organizations</IonLabel>
          </IonItem>
          <IonItem button color="white" routerLink="/speakers">
            <IonIcon icon={people} slot="start"></IonIcon>
            <IonLabel>Speakers</IonLabel>
          </IonItem>
          <IonItem button color="white" routerLink="/profile">
            <IonIcon icon={person} slot="start"></IonIcon>
            <IonLabel>Profile</IonLabel>
          </IonItem>
          {userIsAdmin ? (
            <>
              <IonItemDivider>
                <IonLabel>Manage</IonLabel>
              </IonItemDivider>
              <IonItem button color="white" routerLink="/manage/venue/new">
                <IonIcon icon={mapOutline} slot="start"></IonIcon>
                <IonLabel>Add venue</IonLabel>
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