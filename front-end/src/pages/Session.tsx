import { useState } from 'react';
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
  useIonToast,
  useIonViewWillEnter
} from '@ionic/react';
import { close } from 'ionicons/icons';

import SessionCard from '../components/SessionCard';

import { Session } from 'models/session';
import { toastMessageDefaults } from '../utils';
import {
  addSessionToUserFavorites,
  getSession,
  isSessionUserFavorite,
  removeSessionFromUserFavorites
} from '../utils/data';

const SessionPage: React.FC = () => {
  const history = useHistory();
  const { sessionId }: { sessionId: string } = useParams();
  const [showMessage] = useIonToast();

  const [session, setSession] = useState<Session>();
  const [isUserFavorite, setIsUserFavorite] = useState<boolean>();

  useIonViewWillEnter(() => {
    loadData();
  }, []);

  const loadData = async (): Promise<void> => {
    try {
      const session = await getSession(sessionId);
      const isUserFavorite = await isSessionUserFavorite(sessionId);

      setSession(session);
      setIsUserFavorite(isUserFavorite);
    } catch (err) {
      await showMessage({ ...toastMessageDefaults, message: 'Session not found.' });
    }
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
      <IonContent>
        <SessionCard
          session={session}
          isUserFavorite={isUserFavorite}
          toggleUserFavoriteSession={toggleUserFavoriteSession}
        ></SessionCard>
      </IonContent>
    </IonPage>
  );
};

export default SessionPage;
