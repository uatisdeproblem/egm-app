import { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonRow,
  IonSearchbar,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import { refresh } from 'ionicons/icons';

import { isMobileMode } from '../utils';
import { getSpeakers } from '../utils/data';
import { Speaker } from 'models/speaker';

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
          [x.name, x.organization.name, x.title, x.description].some(f => f.toLowerCase().includes(searchTerm))
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
        <IonList>
          <div style={{ maxWidth: 500, margin: '0 auto' }}>
            <IonRow className="ion-align-items-center">
              <IonCol size="10">
                <IonSearchbar
                  color="white"
                  placeholder="Filter by name, organization, title..."
                  onIonChange={e => filterSpeakers(e.detail.value!)}
                ></IonSearchbar>
              </IonCol>
              <IonCol size="2" className="ion-text-center">
                <IonButton fill="clear" color="medium" onClick={loadData}>
                  <IonIcon icon={refresh} slot="icon-only"></IonIcon>
                </IonButton>
              </IonCol>
            </IonRow>
          </div>
          <IonGrid>
            <IonRow className="ion-justify-content-center">
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
      </IonContent>
    </IonPage>
  );
};

export default SpeakersPage;
