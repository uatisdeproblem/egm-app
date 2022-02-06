import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';

import DummyContainer from '../components/DummyContainer';

import { isMobileMode } from '../utils';

const ProfilePage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        {isMobileMode() ? (
          <IonToolbar color="ideaToolbar">
            <IonTitle>Profile</IonTitle>
          </IonToolbar>
        ) : (
          ''
        )}
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Profile</IonTitle>
          </IonToolbar>
        </IonHeader>
        <DummyContainer name="Profile page" />
      </IonContent>
    </IonPage>
  );
};

export default ProfilePage;
