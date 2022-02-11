import { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import {
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonRow,
  IonSearchbar,
  IonTitle,
  IonToolbar
} from '@ionic/react';

import { isMobileMode } from '../utils';
import { getSpeakers } from '../utils/data';
import { Speaker } from '../models';

import SpeakerCard from '../components/SpeakerCard';

const SpeakersPage: React.FC = () => {
  const history = useHistory();

  const [speakers, setSpeakers] = useState(new Array<Speaker>());
  const [filteredSpeakers, setFilteredSpeakers] = useState(new Array<Speaker>());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (): Promise<void> => {
    const speakers = await getSpeakers();
    setSpeakers(speakers);
    setFilteredSpeakers(speakers);
  };

  const filterSpeakers = (search = ''): void => {
    let filteredSpeakers: Speaker[];

    filteredSpeakers = speakers.filter(x =>
      search
        .split(' ')
        .every(searchTerm =>
          [x.name, x.organization || '', x.title || '', x.description || ''].some(f =>
            f.toLowerCase().includes(searchTerm)
          )
        )
    );

    setFilteredSpeakers(filteredSpeakers);
  };

  return (
    <IonPage>
      <IonHeader>
        {isMobileMode() ? (
          <IonToolbar color="ideaToolbar">
            <IonTitle>Speakers</IonTitle>
          </IonToolbar>
        ) : (
          ''
        )}
      </IonHeader>
      <IonContent>
        <IonList style={{ padding: 0 }}>
          <IonSearchbar
            color="white"
            placeholder="Filter by name, organization, title..."
            onIonChange={e => filterSpeakers(e.detail.value!)}
          ></IonSearchbar>

          <IonGrid>
            <IonRow>
              {!filteredSpeakers ? (
                <IonCol>
                  <SpeakerCard></SpeakerCard>
                </IonCol>
              ) : !filteredSpeakers.length ? (
                <IonCol>
                  <IonItem lines="none">
                    <IonLabel className="ion-text-center">No elements found.</IonLabel>
                  </IonItem>
                </IonCol>
              ) : (
                filteredSpeakers.map(speaker => (
                  <IonCol key={speaker.id}>
                    <SpeakerCard speaker={speaker} select={() => history.push('speaker/' + speaker.id)}></SpeakerCard>
                  </IonCol>
                ))
              )}
            </IonRow>
          </IonGrid>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default SpeakersPage;
