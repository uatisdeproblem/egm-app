import { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonSkeletonText,
  IonBadge,
  IonNote,
  IonSegment,
  IonSegmentButton,
  IonIcon,
  IonButton,
  useIonToast,
  IonSearchbar,
  useIonViewDidEnter,
  IonText
} from '@ionic/react';
import { close, locationOutline, peopleOutline, star, starOutline } from 'ionicons/icons';

import { Session, Speaker } from '../models';
import {
  formatDateShort,
  formatTime,
  isMobileMode,
  SessionTypeColor,
  SessionTypeStr,
  toastMessageDefaults
} from '../utils';
import {
  addSessionToUserFavorites,
  getSessions,
  getSessionsDays,
  getSessionsSpeakersMap,
  getUserFavoriteSessionsSet,
  removeSessionFromUserFavorites
} from '../utils/data';

import SessionCard from '../components/SessionCard';

const AgendaPage: React.FC = () => {
  const history = useHistory();
  const [showMessage] = useIonToast();
  const [segment, setSegment] = useState('');

  const [sessions, setSessions] = useState(new Array<Session>());
  const [speakersBySessionMap, setSpeakersBySessionMap] = useState(new Map<string, Speaker[]>());
  const [userFavoriteSessionsSet, setUserFavoriteSessionsSet] = useState(new Set<string>());
  const [sessionsDays, setSessionsDays] = useState(new Array<string>());
  const [filteredSessions, setFilteredSessions] = useState(new Array<Session>());
  const [currentSession, setCurrentSession] = useState<Session>();
  const [currentSessionSpeakers, setCurrentSessionSpeakers] = useState(new Array<Speaker>());

  useEffect(() => {
    loadData();
  }, []);

  useIonViewDidEnter(() => {
    refreshUserFavoriteSessions();
  });

  const loadData = async (): Promise<void> => {
    const sessions = await getSessions();
    const userFavoriteSessions = await getUserFavoriteSessionsSet();
    const speakersBySessionMap = await getSessionsSpeakersMap();
    const sessionsDays = getSessionsDays(sessions);

    setSessions(sessions);
    setSpeakersBySessionMap(speakersBySessionMap);
    setSessionsDays(sessionsDays);
    setUserFavoriteSessionsSet(userFavoriteSessions);
    setFilteredSessions(sessions.filter(s => userFavoriteSessions.has(s.id)));
  };

  const filterSessions = (segment = '', search = ''): void => {
    let filteredSessions: Session[];

    if (!segment) filteredSessions = sessions.filter(s => isSessionUserFavorite(s));
    else filteredSessions = sessions.filter(s => s.startsAt.startsWith(segment));

    filteredSessions = filteredSessions.filter(x =>
      search
        .split(' ')
        .every(searchTerm =>
          [
            x.name,
            x.description || '',
            SessionTypeStr[x.type],
            x.Venue.name,
            ...getSpeakersOfSession(x).map(sp => sp.name)
          ].some(f => f.toLowerCase().includes(searchTerm))
        )
    );

    setFilteredSessions(filteredSessions);
    setSegment(segment);
  };

  const getSpeakersOfSession = (session: Session): Speaker[] => speakersBySessionMap.get(session.id) || [];

  const isSessionUserFavorite = (session: Session): boolean => userFavoriteSessionsSet.has(session.id);
  const toggleUserFavoriteSession = async (session: Session, event?: any): Promise<void> => {
    if (event) event.stopPropagation();

    try {
      if (isSessionUserFavorite(session)) {
        await removeSessionFromUserFavorites(session);
        userFavoriteSessionsSet.delete(session.id);
      } else {
        await addSessionToUserFavorites(session);
        userFavoriteSessionsSet.add(session.id);
      }
      setUserFavoriteSessionsSet(new Set(userFavoriteSessionsSet));
    } catch (err) {
      await showMessage({ ...toastMessageDefaults, message: 'Failed saving favorite session.', color: 'danger' });
    }
  };

  const selectCurrentSession = (session?: Session): void => {
    setCurrentSession(session);
    setCurrentSessionSpeakers(session ? getSpeakersOfSession(session) : []);
    if (session && isMobileMode()) history.push('session/' + session.id);
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
          <IonList style={{ padding: 0 }}>
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
              <IonItem>
                <IonLabel>
                  <IonSkeletonText animated style={{ width: '60%' }} />
                </IonLabel>
              </IonItem>
            ) : !filteredSessions.length ? (
              <p className="ion-padding">
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
              </p>
            ) : (
              filteredSessions.map(session => (
                <IonItem
                  lines="none"
                  color="white"
                  style={{
                    boxShadow: '0 0 5px 3px rgba(0, 0, 0, 0.05)',
                    borderRadius: 12,
                    margin: 8
                  }}
                  key={session.id}
                  button
                  onClick={() => selectCurrentSession(session)}
                >
                  <IonNote slot="start" className="ion-text-center" style={{ marginTop: 4, lineHeight: 1.5 }}>
                    <b style={{ display: 'block' }}>{formatTime(session.startsAt)}</b>
                    <span style={{ display: 'block' }}>{formatTime(session.endsAt)}</span>
                    <IonButton
                      fill="clear"
                      size="small"
                      color="secondary"
                      onClick={event => toggleUserFavoriteSession(session, event)}
                    >
                      <IonIcon icon={isSessionUserFavorite(session) ? star : starOutline}></IonIcon>
                    </IonButton>
                  </IonNote>
                  <IonLabel className="ion-text-wrap">
                    <IonText style={{ fontWeight: 500 }}>{session.name}</IonText>
                    <p
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}
                    >
                      {session.description}
                    </p>
                    <p>
                      <IonIcon icon={locationOutline} style={{ verticalAlign: 'middle', marginRight: 4 }}></IonIcon>
                      {session.Venue ? <Link to={'/venues/' + session.Venue.id}>{session.Venue.name}</Link> : ''}
                      <br />
                      <IonIcon icon={peopleOutline} style={{ verticalAlign: 'middle', marginRight: 4 }}></IonIcon>
                      {getSpeakersOfSession(session).map(speaker => (
                        <Link key={speaker.id} to={'/speakers/' + speaker.id} style={{ marginRight: 10 }}>
                          {speaker.name}
                        </Link>
                      ))}
                    </p>
                  </IonLabel>
                  <IonBadge slot="end" color={SessionTypeColor[session.type]}>
                    {SessionTypeStr[session.type]}
                  </IonBadge>
                </IonItem>
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
                speakers={currentSessionSpeakers}
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
            <p className="ion-padding">
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
