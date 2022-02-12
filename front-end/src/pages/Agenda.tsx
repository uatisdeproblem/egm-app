import { useEffect, useState } from 'react';
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
  IonSearchbar,
  useIonViewDidEnter
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

const AgendaPage: React.FC = () => {
  const history = useHistory();
  const [showMessage] = useIonToast();
  const [segment, setSegment] = useState('');

  const [sessions, setSessions] = useState<Session[]>();
  const [userFavoriteSessionsSet, setUserFavoriteSessionsSet] = useState(new Set<string>());
  const [sessionsDays, setSessionsDays] = useState(new Array<string>());
  const [filteredSessions, setFilteredSessions] = useState(new Array<Session>());
  const [currentSession, setCurrentSession] = useState<Session>();

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
    setFilteredSessions(sessions.filter(s => userFavoriteSessions.has(s.sessionId)));
  };

  const filterSessions = (segment = '', search = ''): void => {
    let filteredSessions: Session[];

    if (!segment) filteredSessions = sessions?.filter(s => isSessionUserFavorite(s)) || [];
    else filteredSessions = sessions?.filter(s => s.startsAt.startsWith(segment)) || [];

    filteredSessions = filteredSessions.filter(x =>
      search
        .split(' ')
        .every(searchTerm =>
          [x.name, x.description || '', SessionTypeStr[x.type], x.venue.name, ...x.speakers.map(sp => sp.name)].some(
            f => f.toLowerCase().includes(searchTerm)
          )
        )
    );

    setFilteredSessions(filteredSessions);
    setSegment(segment);
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
            <IonSegmentButton value="" onClick={() => filterSessions()} style={{ maxWidth: 80 }}>
              <IonIcon icon={star} />
            </IonSegmentButton>
            {sessionsDays.map(day => (
              <IonSegmentButton
                key={day}
                value={day}
                onClick={() => filterSessions(day)}
                style={{ maxWidth: 120, textTransform: 'none' }}
              >
                {formatDateShort(day)}
              </IonSegmentButton>
            ))}
          </IonSegment>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div style={isMobileMode() ? {} : { width: '50%', float: 'left' }}>
          <IonList>
            {segment || userFavoriteSessionsSet.size > 0 ? (
              <IonSearchbar
                color="white"
                placeholder="Filter by title, description, venue, speaker..."
                onIonChange={e => filterSessions(segment, e.detail.value!)}
              ></IonSearchbar>
            ) : (
              ''
            )}
            {!filteredSessions ? (
              <SessionItem></SessionItem>
            ) : !filteredSessions.length ? (
              <IonItem lines="none">
                <IonLabel className="ion-text-wrap ion-text-center">
                  {!segment && userFavoriteSessionsSet.size === 0 ? (
                    <>
                      You don't have any favorite session yet.
                      <br />
                      <i>Select a day and start building your customized agenda.</i> 😉
                    </>
                  ) : (
                    <>No elements found.</>
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
        </div>
        <div
          style={isMobileMode() ? { display: 'none' } : { width: '50%', float: 'right', right: 0, position: 'fixed' }}
        >
          {currentSession ? (
            <>
              <SessionCard
                session={currentSession}
                isUserFavorite={isSessionUserFavorite(currentSession)}
                toggleUserFavoriteSession={() => toggleUserFavoriteSession(currentSession)}
              ></SessionCard>
              <p>
                <IonButton fill="clear" color="medium" expand="full" onClick={() => selectCurrentSession()}>
                  <IonIcon icon={close} slot="start"></IonIcon> Close
                </IonButton>
              </p>
            </>
          ) : (
            <p>
              <IonItem lines="none">
                <IonLabel className="ion-text-center">No session selected.</IonLabel>
              </IonItem>
            </p>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AgendaPage;
