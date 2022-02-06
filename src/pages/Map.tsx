import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';

import DummyContainer from '../components/DummyContainer';

import { isMobileMode } from '../utils';

const MapPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        {isMobileMode() ? (
          <IonToolbar color="ideaToolbar">
            <IonTitle>Map</IonTitle>
          </IonToolbar>
        ) : (
          ''
        )}
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Map</IonTitle>
          </IonToolbar>
        </IonHeader>
        <DummyContainer name="Map page" />
      </IonContent>
    </IonPage>
  );
};

export default MapPage;
