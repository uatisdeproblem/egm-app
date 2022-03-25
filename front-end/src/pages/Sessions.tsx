import { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonIcon,
  IonButton,
  useIonToast,
  useIonViewDidEnter,
  IonInfiniteScroll,
  IonInfiniteScrollContent
} from '@ionic/react';
import { close, star } from 'ionicons/icons';

import { Session } from 'models/session';
import { formatDateShort, isMobileMode, SessionTypeStr, toastMessageDefaults } from '../utils';
import {
  addSessionToUserFavorites,
  getSessions,
  getSessionsDays,
  getUserFavoriteSessionsSet,
  removeSessionFromUserFavorites
} from '../utils/data';

import SessionCard from '../components/SessionCard';
import SessionItem from '../components/SessionItem';
import Searchbar from '../components/Searchbar';
import ManageEntityButton from '../components/ManageEntityButton';

const PAGINATION_NUM_MAX_ELEMENTS = 24;

const SessionsPage: React.FC = () => {
  const history = useHistory();
  const [showMessage] = useIonToast();
  const [segment, setSegment] = useState('');

  const [sessions, setSessions] = useState<Session[]>();
  const [userFavoriteSessionsSet, setUserFavoriteSessionsSet] = useState(new Set<string>());
  const [sessionsDays, setSessionsDays] = useState(new Array<string>());
  const [filteredSessions, setFilteredSessions] = useState<Array<Session>>();
  const [currentSession, setCurrentSession] = useState<Session>();

  const searchbar = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  useIonViewDidEnter(() => {
    refreshUserFavoriteSessions();
  });

  const loadData = async (): Promise<void> => {
    const sessions = (await getSessions()) || [];
    const userFavoriteSessions = await getUserFavoriteSessionsSet();
    const sessionsDays = getSessionsDays(sessions);

    setSessions(sessions);
    setSessionsDays(sessionsDays);
    setUserFavoriteSessionsSet(userFavoriteSessions);
    setFilteredSessions(
      sessions.filter(s => userFavoriteSessions.has(s.sessionId)).slice(0, PAGINATION_NUM_MAX_ELEMENTS)
    );
  };

  const changeSegment = (segment: string): void => {
    setSegment(segment);
    filterSessions('', segment);
  };
  const filterSessions = (search = '', forceSegment?: string, scrollToNextPage?: any): void => {
    const startPaginationAfterId = filteredSessions?.length
      ? filteredSessions[filteredSessions.length - 1].sessionId
      : null;

    let filteredList: Session[];

    const useSegment = forceSegment !== undefined ? forceSegment : segment;

    if (!useSegment) filteredList = sessions?.filter(s => isSessionUserFavorite(s)) || [];
    else filteredList = sessions?.filter(s => s.startsAt.startsWith(useSegment)) || [];

    filteredList = filteredList.filter(x =>
      search
        .split(' ')
        .every(searchTerm =>
          [
            x.name,
            x.description,
            SessionTypeStr[x.type],
            x.venue.name,
            x.speaker1.name,
            x.speaker2.name,
            x.speaker3.name
          ]
            .filter(x => x)
            .some(f => f.toLowerCase().includes(searchTerm))
        )
    );

    let indexOfLastOfPreviousPage = 0;

    if (scrollToNextPage && filteredList.length > PAGINATION_NUM_MAX_ELEMENTS)
      indexOfLastOfPreviousPage = filteredList.findIndex(x => x.sessionId === startPaginationAfterId) || 0;

    filteredList = filteredList.slice(0, indexOfLastOfPreviousPage + PAGINATION_NUM_MAX_ELEMENTS);

    if (scrollToNextPage) setTimeout(() => scrollToNextPage.complete(), 100);

    setFilteredSessions(filteredList);
  };

  const isSessionUserFavorite = (session: Session): boolean => userFavoriteSessionsSet.has(session.sessionId);
  const toggleUserFavoriteSession = async (session: Session, event?: any): Promise<void> => {
    if (event) event.stopPropagation();

    try {
      if (isSessionUserFavorite(session)) {
        await removeSessionFromUserFavorites(session);
        userFavoriteSessionsSet.delete(session.sessionId);
      } else {
        await addSessionToUserFavorites(session);
        userFavoriteSessionsSet.add(session.sessionId);
      }
      setUserFavoriteSessionsSet(new Set(userFavoriteSessionsSet));
    } catch (err) {
      await showMessage({ ...toastMessageDefaults, message: 'Failed saving favorite session.', color: 'danger' });
    }
  };

  const selectCurrentSession = (session?: Session): void => {
    setCurrentSession(session);
    if (session && isMobileMode()) history.push('session/' + session.sessionId);
  };

  const refreshUserFavoriteSessions = async (): Promise<void> =>
    setUserFavoriteSessionsSet(await getUserFavoriteSessionsSet());

  return (
    <IonPage>
      <IonHeader>
        {isMobileMode() ? (
          <IonToolbar color="ideaToolbar">
            <IonTitle>Agenda</IonTitle>
          </IonToolbar>
        ) : (
          ''
        )}
        <IonToolbar color="ideaToolbar" style={{ '--min-height': 'auto' }}>
          <IonSegment scrollable value={segment}>
            <IonSegmentButton value="" onClick={() => changeSegment('')} style={{ maxWidth: 80 }}>
              <IonIcon icon={star} />
            </IonSegmentButton>
            {sessionsDays.map(day => (
              <IonSegmentButton key={day} value={day} onClick={() => changeSegment(day)} style={{ maxWidth: 120 }}>
                {formatDateShort(day)}
              </IonSegmentButton>
            ))}
          </IonSegment>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {sessions ? (
          <>
            <div style={isMobileMode() ? {} : { width: '50%', float: 'left' }}>
              <IonList>
                {segment || userFavoriteSessionsSet.size > 0 ? (
                  <Searchbar
                    placeholder="Filter by title, venue, speaker..."
                    filterFn={filterSessions}
                    refreshFn={loadData}
                    ref={searchbar}
                  ></Searchbar>
                ) : (
                  ''
                )}
                {!filteredSessions ? (
                  <SessionItem></SessionItem>
                ) : filteredSessions.length === 0 ? (
                  <IonItem lines="none">
                    <IonLabel className="ion-text-wrap ion-text-center">
                      {!segment && userFavoriteSessionsSet.size === 0 ? (
                        <>
                          You don't have any favorite session yet.
                          <br />
                          <i>Select a day and start building your customized agenda.</i> 😉
                        </>
                      ) : (
                        <>No sessions found.</>
                      )}
                    </IonLabel>
                  </IonItem>
                ) : (
                  filteredSessions.map(session => (
                    <SessionItem
                      key={session.sessionId}
                      session={session}
                      isUserFavorite={isSessionUserFavorite(session)}
                      toggleUserFavorite={() => toggleUserFavoriteSession(session)}
                      select={() => selectCurrentSession(session)}
                    ></SessionItem>
                  ))
                )}
              </IonList>
              <IonInfiniteScroll
                onIonInfinite={event => filterSessions((searchbar as any)?.current?.value, undefined, event?.target)}
              >
                <IonInfiniteScrollContent></IonInfiniteScrollContent>
              </IonInfiniteScroll>
            </div>
            <div
              style={
                isMobileMode() ? { display: 'none' } : { width: '50%', float: 'right', right: 0, position: 'fixed' }
              }
            >
              {currentSession ? (
                <>
                  <SessionCard
                    session={currentSession}
                    isUserFavorite={isSessionUserFavorite(currentSession)}
                    toggleUserFavoriteSession={() => toggleUserFavoriteSession(currentSession)}
                  ></SessionCard>
                  <p>
                    <ManageEntityButton type="session" id={currentSession.sessionId} full></ManageEntityButton>
                    <IonButton fill="clear" color="medium" expand="full" onClick={() => selectCurrentSession()}>
                      <IonIcon icon={close} slot="start"></IonIcon> Close
                    </IonButton>
                  </p>
                </>
              ) : filteredSessions && filteredSessions.length > 0 ? (
                <p>
                  <IonItem lines="none">
                    <IonLabel className="ion-text-center">No session selected.</IonLabel>
                  </IonItem>
                </p>
              ) : (
                ''
              )}
            </div>
          </>
        ) : (
          ''
        )}
      </IonContent>
    </IonPage>
  );
};

export default SessionsPage;
