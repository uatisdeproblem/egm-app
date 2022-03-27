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
  IonTitle,
  IonToolbar
} from '@ionic/react';

import { isMobileMode } from '../utils';
import { getSpeakers } from '../utils/data';
import { Speaker } from 'models/speaker';

import SpeakerCard from '../components/SpeakerCard';
import Searchbar from '../components/Searchbar';

const SpeakersPage: React.FC = () => {
  const history = useHistory();

  const [speakers, setSpeakers] = useState<Array<Speaker>>();
  const [filteredSpeakers, setFilteredSpeakers] = useState<Array<Speaker>>();

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

    filteredSpeakers = (speakers || []).filter(x =>
      search
        .split(' ')
        .every(searchTerm =>
          [x.name, x.organization.name, x.title, x.description]
            .filter(x => x)
            .some(f => f.toLowerCase().includes(searchTerm))
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
        {speakers ? (
          <IonList>
            <Searchbar
              placeholder="Filter by name, organization, title..."
              filterFn={filterSpeakers}
              refreshFn={loadData}
            ></Searchbar>
            <IonGrid>
              <IonRow className="ion-justify-content-center">
                {!filteredSpeakers ? (
                  <IonCol>
                    <SpeakerCard></SpeakerCard>
                  </IonCol>
                ) : filteredSpeakers && filteredSpeakers.length === 0 ? (
                  <IonCol>
                    <IonItem lines="none" color="white">
                      <IonLabel className="ion-text-center">No speakers found.</IonLabel>
                    </IonItem>
                  </IonCol>
                ) : (
                  filteredSpeakers.map(speaker => (
                    <IonCol key={speaker.speakerId} size="12" sizeSm="6" sizeMd="4" sizeLg="3" sizeXl="2">
                      <SpeakerCard
                        speaker={speaker}
                        preview
                        select={() => history.push('speaker/' + speaker.speakerId)}
                      ></SpeakerCard>
                    </IonCol>
                  ))
                )}
              </IonRow>
            </IonGrid>
          </IonList>
        ) : (
          ''
        )}
      </IonContent>
    </IonPage>
  );
};

export default SpeakersPage;
