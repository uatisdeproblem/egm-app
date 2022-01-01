import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';

import DummyContainer from '../components/DummyContainer';

const ProfilePage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Profile</IonTitle>
        </IonToolbar>
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
