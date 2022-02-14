import { useState } from 'react';
import { useParams } from 'react-router';
import { IonContent, IonPage, useIonToast, useIonViewWillEnter } from '@ionic/react';

import { Speaker } from 'models/speaker';
import { toastMessageDefaults } from '../utils';
import { getSpeaker } from '../utils/data';

import SpeakerCard from '../components/SpeakerCard';
import EntityHeader from '../components/EntityHeader';

const SpeakerPage: React.FC = () => {
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
      <EntityHeader title="Speaker details" type="speaker" id={speakerId}></EntityHeader>
      <IonContent>
        <div className="cardContainer">
          <SpeakerCard speaker={speaker}></SpeakerCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SpeakerPage;
