import { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router';
import {
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
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

const PAGINATION_NUM_MAX_ELEMENTS = 24;

const SpeakersPage: React.FC = () => {
  const history = useHistory();

  const searchbar = useRef(null);

  const [speakers, setSpeakers] = useState<Array<Speaker>>();
  const [filteredSpeakers, setFilteredSpeakers] = useState<Array<Speaker>>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (): Promise<void> => {
    const speakers = await getSpeakers();
    setSpeakers(speakers);
    setFilteredSpeakers(speakers.slice(0, PAGINATION_NUM_MAX_ELEMENTS));
  };

  const filterSpeakers = (search = '', scrollToNextPage?: any): void => {
    const startPaginationAfterId = filteredSpeakers?.length
      ? filteredSpeakers[filteredSpeakers.length - 1].speakerId
      : null;

    let filteredList: Speaker[];

    filteredList = (speakers || []).filter(x =>
      search
        .split(' ')
        .every(searchTerm =>
          [x.name, x.organization.name, x.title, x.description]
            .filter(x => x)
            .some(f => f.toLowerCase().includes(searchTerm))
        )
    );

    let indexOfLastOfPreviousPage = 0;

    if (scrollToNextPage && filteredList.length > PAGINATION_NUM_MAX_ELEMENTS)
      indexOfLastOfPreviousPage = filteredList.findIndex(x => x.speakerId === startPaginationAfterId) || 0;

    filteredList = filteredList.slice(0, indexOfLastOfPreviousPage + PAGINATION_NUM_MAX_ELEMENTS);

    if (scrollToNextPage) setTimeout(() => scrollToNextPage.complete(), 100);

    setFilteredSpeakers(filteredList);
  };

  const getSearchbarValue = (): string => (searchbar as any)?.current?.value;

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
              ref={searchbar}
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
                    <IonCol key={speaker.speakerId} size="12" sizeSm="6" sizeMd="4" sizeLg="3">
                      <SpeakerCard
                        speaker={speaker}
                        preview
                        select={() => history.push('speaker/' + speaker.speakerId)}
                      ></SpeakerCard>
                    </IonCol>
                  ))
                )}
              </IonRow>
              <IonRow>
                <IonCol>
                  <IonInfiniteScroll onIonInfinite={event => filterSpeakers(getSearchbarValue(), event?.target)}>
                    <IonInfiniteScrollContent></IonInfiniteScrollContent>
                  </IonInfiniteScroll>
                </IonCol>
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
