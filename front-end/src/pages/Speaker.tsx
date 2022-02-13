import { useState } from 'react';
import { useParams, useHistory } from 'react-router';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonButtons,
  IonButton,
  useIonToast,
  useIonViewWillEnter
} from '@ionic/react';
import { close } from 'ionicons/icons';

import { Speaker } from 'models/speaker';
import { toastMessageDefaults } from '../utils';
import { getSpeaker } from '../utils/data';

import SpeakerCard from '../components/SpeakerCard';

const SpeakerPage: React.FC = () => {
  const history = useHistory();
  const { speakerId }: { speakerId: string } = useParams();
  const [showMessage] = useIonToast();

  const [speaker, setSpeaker] = useState<Speaker>();

  useIonViewWillEnter(() => {
    loadData();
  }, []);

  const loadData = async (): Promise<void> => {
    try {
      const speaker = await getSpeaker(speakerId);
      setSpeaker(speaker);
    } catch (err) {
      await showMessage({ ...toastMessageDefaults, message: 'Speaker not found.' });
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="ideaToolbar">
          <IonTitle className="ion-text-left">Speaker details</IonTitle>
          <IonButtons slot="start">
            <IonButton onClick={() => history.goBack()}>
              <IonIcon icon={close} slot="icon-only"></IonIcon>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <SpeakerCard speaker={speaker}></SpeakerCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SpeakerPage;
