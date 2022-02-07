import { useEffect, useState } from 'react';
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
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent
} from '@ionic/react';
import { close } from 'ionicons/icons';

import { Speaker } from '../models';
import { toastMessageDefaults } from '../utils';
import { getSpeaker } from '../utils/data';

const SpeakerPage: React.FC = () => {
  const history = useHistory();
  const { speakerId }: { speakerId: string } = useParams();
  const [showMessage] = useIonToast();

  const [speaker, setSpeaker] = useState<Speaker>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (): Promise<void> => {
    const speaker = await getSpeaker(speakerId);
    if (!speaker) {
      await showMessage({ ...toastMessageDefaults, message: 'Speaker not found.' });
      return;
    }

    setSpeaker(speaker);
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
        {speaker ? (
          <IonCard color="white" style={{ boxShadow: 'none', margin: '0', width: '100%' }}>
            <IonCardHeader>
              <IonCardTitle>{speaker.name}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>{speaker.description}</IonCardContent>
          </IonCard>
        ) : (
          ''
        )}
      </IonContent>
    </IonPage>
  );
};

export default SpeakerPage;
