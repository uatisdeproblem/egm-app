import { useState } from 'react';
import { IonContent, IonPage, useIonToast, useIonViewWillEnter } from '@ionic/react';

import { Speaker } from 'models/speaker';
import { toastMessageDefaults } from '../utils';
import { getSpeaker, getURLPathResourceId } from '../utils/data';

import SpeakerCard from '../components/SpeakerCard';
import EntityHeader from '../components/EntityHeader';

const SpeakerPage: React.FC = () => {
  const [showMessage] = useIonToast();

  const [speaker, setSpeaker] = useState<Speaker>();

  useIonViewWillEnter(() => {
    loadData();
  }, []);

  const loadData = async (): Promise<void> => {
    try {
      const speakerId = getURLPathResourceId();
      const speaker = await getSpeaker(speakerId);
      setSpeaker(speaker);
    } catch (err) {
      await showMessage({ ...toastMessageDefaults, message: 'Speaker not found.' });
    }
  };

  return (
    <IonPage>
      <EntityHeader title="Speaker details" type="speaker" id={speaker?.speakerId || ''}></EntityHeader>
      <IonContent>
        <div className="cardContainer">
          <SpeakerCard speaker={speaker}></SpeakerCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SpeakerPage;
