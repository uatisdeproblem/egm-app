import { Auth } from 'aws-amplify';
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
import { calendar, informationCircle, logOut, map, people, person } from 'ionicons/icons';

import { isMobileMode } from '../utils';

const MenuPage: React.FC = () => {
  const [showAlert] = useIonAlert();

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
      window.location.assign('');
    };
    const buttons = ['Cancel', { text: 'Confirm', handler: doLogout }];
    await showAlert({ header, message, buttons });
  };

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
          <IonItem button routerLink="/agenda">
            <IonIcon icon={calendar} slot="start"></IonIcon>
            <IonLabel>Agenda</IonLabel>
          </IonItem>
          <IonItem button routerLink="/map">
            <IonIcon icon={map} slot="start"></IonIcon>
            <IonLabel>Map and venues</IonLabel>
          </IonItem>
          <IonItem button routerLink="/speakers">
            <IonIcon icon={people} slot="start"></IonIcon>
            <IonLabel>Speakers</IonLabel>
          </IonItem>
          <IonItem button routerLink="/profile">
            <IonIcon icon={person} slot="start"></IonIcon>
            <IonLabel>Profile</IonLabel>
          </IonItem>
          <IonItemDivider>
            <IonLabel>Other actions</IonLabel>
          </IonItemDivider>
          <IonItem button onClick={showAppInfo}>
            <IonIcon icon={informationCircle} slot="start"></IonIcon>
            <IonLabel>App information</IonLabel>
          </IonItem>
          <IonItem button onClick={logout}>
            <IonIcon icon={logOut} slot="start"></IonIcon>
            <IonLabel>Sign-out</IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default MenuPage;
