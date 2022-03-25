import { useState } from 'react';
import { useHistory } from 'react-router';
import { IonContent, IonLabel, IonList, IonListHeader, IonPage, useIonToast, useIonViewWillEnter } from '@ionic/react';

import { Speaker } from 'models/speaker';
import { Session } from 'models/session';

import { toastMessageDefaults } from '../utils';
import { getSessions, getSpeaker, getURLPathResourceId } from '../utils/data';

import EntityHeader from '../components/EntityHeader';
import SpeakerCard from '../components/SpeakerCard';
import SessionItem from '../components/SessionItem';

const SpeakerPage: React.FC = () => {
  const history = useHistory();
  const [showMessage] = useIonToast();

  const [speaker, setSpeaker] = useState<Speaker>();
  const [sessions, setSessions] = useState<Array<Session>>();

  useIonViewWillEnter(() => {
    loadData();
  }, []);

  const loadData = async (): Promise<void> => {
    try {
      const speakerId = getURLPathResourceId();
      const speaker = await getSpeaker(speakerId);
      const sessions = await getSessions({ speaker });

      setSpeaker(speaker);
      setSessions(sessions);
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
        {sessions?.length ? (
          <IonList style={{ maxWidth: 600, margin: '0 auto' }}>
            <IonListHeader>
              <IonLabel class="ion-text-center">
                <h1>Sessions</h1>
              </IonLabel>
            </IonListHeader>
            {sessions.map(session => (
              <SessionItem
                key={session.sessionId}
                session={session}
                select={() => history.push('/session/' + session.sessionId)}
              ></SessionItem>
            ))}
          </IonList>
        ) : (
          ''
        )}
      </IonContent>
    </IonPage>
  );
};

export default SpeakerPage;
