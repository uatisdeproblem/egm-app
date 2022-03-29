import { useState } from 'react';
import { useHistory } from 'react-router';
import {
  IonCol,
  IonContent,
  IonGrid,
  IonImg,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonPage,
  IonRow,
  useIonToast,
  useIonViewWillEnter
} from '@ionic/react';

import { Venue } from 'models/venue';
import { Session } from 'models/session';

import { cleanStrForSearches, SessionTypeStr, toastMessageDefaults } from '../utils';
import { getImageURLByURI, getSessions, getURLPathResourceId, getVenue, venuesFallbackImageURL } from '../utils/data';

import EntityHeader from '../components/EntityHeader';
import VenueCard from '../components/VenueCard';
import SessionItem from '../components/SessionItem';
import Searchbar from '../components/Searchbar';

const VenuePage: React.FC = () => {
  const history = useHistory();
  const [showMessage] = useIonToast();

  const [venue, setVenue] = useState<Venue>();
  const [sessions, setSessions] = useState<Array<Session>>();
  const [filteredSessions, setFilteredSessions] = useState<Array<Session>>();

  useIonViewWillEnter(() => {
    loadData();
  }, []);

  const loadData = async (): Promise<void> => {
    try {
      const venueId = getURLPathResourceId();
      const venue = await getVenue(venueId);
      const sessions = await getSessions({ venue });

      setVenue(venue);
      setSessions(sessions);
      setFilteredSessions(sessions);
    } catch (err) {
      await showMessage({ ...toastMessageDefaults, message: 'Venue not found.' });
    }
  };

  const filterSessions = (search = ''): void => {
    let filteredSessions: Session[];

    filteredSessions = (sessions || []).filter(x =>
      cleanStrForSearches(search)
        .split(' ')
        .every(searchTerm =>
          [
            x.code,
            x.name,
            x.description,
            SessionTypeStr[x.type],
            cleanStrForSearches(x.speaker1.name),
            cleanStrForSearches(x.speaker2.name),
            cleanStrForSearches(x.speaker3.name),
            cleanStrForSearches(x.speaker4.name),
            cleanStrForSearches(x.speaker5.name)
          ]
            .filter(f => f)
            .some(f => f.toLowerCase().includes(searchTerm))
        )
    );

    setFilteredSessions(filteredSessions);
  };

  return (
    <IonPage>
      <EntityHeader title="Venue details" type="venue" id={venue?.venueId || ''}></EntityHeader>
      <IonContent>
        <IonGrid className="contentGrid">
          <IonRow className="ion-justify-content-center">
            <IonCol size="12" sizeMd="6">
              <VenueCard venue={venue}></VenueCard>
              {venue?.planImageURI ? (
                <IonList style={{ padding: 20 }}>
                  <IonListHeader>
                    <IonLabel class="ion-text-center">
                      <h2>Where to find the room</h2>
                    </IonLabel>
                  </IonListHeader>
                  <IonImg
                    src={getImageURLByURI(venue.planImageURI)}
                    onIonError={(e: any) => (e.target.src = venuesFallbackImageURL)}
                  ></IonImg>
                </IonList>
              ) : (
                ''
              )}
            </IonCol>
            {sessions?.length ? (
              <IonCol size="12" sizeMd="6">
                <IonList>
                  <IonListHeader>
                    <IonLabel class="ion-text-center">
                      <h2>Sessions hosted in the venue</h2>
                    </IonLabel>
                  </IonListHeader>
                  <Searchbar placeholder="Filter by title, speaker..." filterFn={filterSessions}></Searchbar>
                  {!filteredSessions ? (
                    <IonCol>
                      <SessionItem></SessionItem>
                    </IonCol>
                  ) : filteredSessions && filteredSessions.length === 0 ? (
                    <IonCol>
                      <IonItem lines="none" color="white">
                        <IonLabel className="ion-text-center">No sessions found.</IonLabel>
                      </IonItem>
                    </IonCol>
                  ) : (
                    filteredSessions?.map(session => (
                      <SessionItem
                        key={session.sessionId}
                        session={session}
                        select={() => history.push('/session/' + session.sessionId)}
                      ></SessionItem>
                    ))
                  )}
                </IonList>
              </IonCol>
            ) : (
              ''
            )}
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default VenuePage;
