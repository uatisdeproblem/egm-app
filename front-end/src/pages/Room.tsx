import { useRef, useState } from 'react';
import { useHistory } from 'react-router';
import {
  IonCol,
  IonContent,
  IonGrid,
  IonImg,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonPage,
  IonRow,
  useIonToast,
  useIonViewWillEnter
} from '@ionic/react';

import { Room } from 'models/room';
import { Session } from 'models/session';

import { cleanStrForSearches, SessionTypeStr, toastMessageDefaults } from '../utils';
import {
  getImageURLByURI,
  getRoom,
  getSessions,
  getURLPathResourceId,
  openImage,
  roomsFallbackImageURL
} from '../utils/data';

import EntityHeader from '../components/EntityHeader';
import SessionItem from '../components/SessionItem';
import Searchbar from '../components/Searchbar';
import RoomCard from '../components/RoomCard';

const PAGINATION_NUM_MAX_ELEMENTS = 24;

const RoomPage: React.FC = () => {
  const history = useHistory();
  const searchbar = useRef(null);
  const [showMessage] = useIonToast();

  const [room, setRoom] = useState<Room>();
  const [sessions, setSessions] = useState<Array<Session>>();
  const [filteredSessions, setFilteredSessions] = useState<Array<Session>>();

  useIonViewWillEnter(() => {
    loadData();
  }, []);

  const loadData = async (): Promise<void> => {
    try {
      const roomId = getURLPathResourceId();
      const room = await getRoom(roomId);
      const sessions = await getSessions({ room });

      setRoom(room);
      setSessions(sessions);
      setFilteredSessions(sessions.slice(0, PAGINATION_NUM_MAX_ELEMENTS));
    } catch (err) {
      await showMessage({ ...toastMessageDefaults, message: 'Room not found.' });
    }
  };

  const filterSessions = (search = '', scrollToNextPage?: any): void => {
    const startPaginationAfterId = filteredSessions?.length
      ? filteredSessions[filteredSessions.length - 1].sessionId
      : null;

    let filteredList: Session[];

    filteredList = (sessions || []).filter(x =>
      cleanStrForSearches(search)
        .toLowerCase()
        .split(' ')
        .every(searchTerm =>
          [
            x.code,
            x.name,
            x.description,
            SessionTypeStr[x.type],
            cleanStrForSearches(x.speaker1.name),
            x.speaker2 ? cleanStrForSearches(x.speaker2.name) : null,
            x.speaker3 ? cleanStrForSearches(x.speaker3.name) : null,
            x.speaker4 ? cleanStrForSearches(x.speaker4.name) : null,
            x.speaker5 ? cleanStrForSearches(x.speaker5.name) : null
          ].some(f => f && f.toLowerCase().includes(searchTerm))
        )
    );

    let indexOfLastOfPreviousPage = 0;

    if (scrollToNextPage && filteredList.length > PAGINATION_NUM_MAX_ELEMENTS)
      indexOfLastOfPreviousPage = filteredList.findIndex(x => x.sessionId === startPaginationAfterId) || 0;

    filteredList = filteredList.slice(0, indexOfLastOfPreviousPage + PAGINATION_NUM_MAX_ELEMENTS);

    if (scrollToNextPage) setTimeout(() => scrollToNextPage.complete(), 100);

    setFilteredSessions(filteredList);
  };

  const getSearchbarValue = (): string => (searchbar as any)?.current?.value;

  return (
    <IonPage>
      <EntityHeader title="Room details" type="room" id={room?.roomId || ''}></EntityHeader>
      <IonContent>
        <IonGrid className="contentGrid">
          <IonRow className="ion-justify-content-center">
            <IonCol size="12" sizeMd="6">
              <RoomCard room={room}></RoomCard>
              {room?.planImageURI ? (
                <IonList style={{ padding: 20 }}>
                  <IonListHeader>
                    <IonLabel class="ion-text-center">
                      <h2>Where to find the room</h2>
                    </IonLabel>
                  </IonListHeader>
                  <IonImg
                    className="tappable inGallery"
                    style={{ marginTop: 12 }}
                    src={getImageURLByURI(room.planImageURI)}
                    onIonError={(e: any) => (e.target.src = roomsFallbackImageURL)}
                    onClick={() => openImage(room.planImageURI)}
                  ></IonImg>
                </IonList>
              ) : (
                ''
              )}
            </IonCol>
            {sessions?.length ? (
              <>
                <IonCol size="12" sizeMd="6">
                  <IonList>
                    <IonListHeader>
                      <IonLabel class="ion-text-center">
                        <h2>Sessions hosted in the room</h2>
                      </IonLabel>
                    </IonListHeader>
                    <Searchbar
                      placeholder="Filter by title, speaker..."
                      filterFn={filterSessions}
                      ref={searchbar}
                    ></Searchbar>
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
                          showDate
                          select={() => history.push('/session/' + session.sessionId)}
                        ></SessionItem>
                      ))
                    )}
                  </IonList>
                </IonCol>
                <IonCol>
                  <IonInfiniteScroll onIonInfinite={event => filterSessions(getSearchbarValue(), event?.target)}>
                    <IonInfiniteScrollContent></IonInfiniteScrollContent>
                  </IonInfiniteScroll>
                </IonCol>
              </>
            ) : (
              ''
            )}
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default RoomPage;
