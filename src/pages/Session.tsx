import { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonButtons,
  IonButton,
  useIonToast
} from '@ionic/react';
import { close } from 'ionicons/icons';

import SessionCard from '../components/SessionCard';

import { Session, Speaker } from '../models';
import { toastMessageDefaults } from '../utils';
import {
  addSessionToUserFavorites,
  getSession,
  getSessionSpeakers,
  isSessionUserFavorite,
  removeSessionFromUserFavorites
} from '../utils/data';

const SessionPage: React.FC = () => {
  const history = useHistory();
  const { sessionId }: { sessionId: string } = useParams();
  const [showMessage] = useIonToast();

  const [session, setSession] = useState<Session>();
  const [sessionSpeakers, setSessionSpeakers] = useState(new Array<Speaker>());
  const [isUserFavorite, setIsUserFavorite] = useState<boolean>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (): Promise<void> => {
    const session = await getSession(sessionId);
    if (!session) {
      await showMessage({ ...toastMessageDefaults, message: 'Session not found.' });
      return;
    }

    const sessionSpeakers = await getSessionSpeakers(sessionId);
    const isUserFavorite = await isSessionUserFavorite(sessionId);

    setSession(session);
    setSessionSpeakers(sessionSpeakers);
    setIsUserFavorite(isUserFavorite);
  };

  const toggleUserFavoriteSession = async (): Promise<void> => {
    if (!session) return;

    try {
      if (isUserFavorite) {
        await removeSessionFromUserFavorites(session);
        setIsUserFavorite(false);
      } else {
        await addSessionToUserFavorites(session);
        setIsUserFavorite(true);
      }
    } catch (err) {
      await showMessage({ ...toastMessageDefaults, message: 'Failed saving favorite session.', color: 'danger' });
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="ideaToolbar">
          <IonTitle className="ion-text-left">Session details</IonTitle>
          <IonButtons slot="start">
            <IonButton onClick={() => history.goBack()}>
              <IonIcon icon={close} slot="icon-only"></IonIcon>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Session details</IonTitle>
          </IonToolbar>
        </IonHeader>
        <SessionCard
          session={session}
          speakers={sessionSpeakers}
          isUserFavorite={isUserFavorite}
          toggleUserFavoriteSession={toggleUserFavoriteSession}
        ></SessionCard>
      </IonContent>
    </IonPage>
  );
};

export default SessionPage;
