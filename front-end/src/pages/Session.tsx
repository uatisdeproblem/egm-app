import { useState } from 'react';
import { IonContent, IonPage, useIonToast, useIonViewWillEnter } from '@ionic/react';

import SessionCard from '../components/SessionCard';

import { Session } from 'models/session';
import { toastMessageDefaults } from '../utils';
import {
  addSessionToUserFavorites,
  getSession,
  getURLPathResourceId,
  isSessionUserFavorite,
  removeSessionFromUserFavorites
} from '../utils/data';

import EntityHeader from '../components/EntityHeader';

const SessionPage: React.FC = () => {
  const [showMessage] = useIonToast();

  const [session, setSession] = useState<Session>();
  const [isUserFavorite, setIsUserFavorite] = useState<boolean>();

  useIonViewWillEnter(() => {
    loadData();
  }, []);

  const loadData = async (): Promise<void> => {
    try {
      const sessionId = getURLPathResourceId();
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
      <EntityHeader title="Session details" type="session" id={session?.sessionId || ''}></EntityHeader>
      <IonContent>
        <div style={{ maxWidth: 600, margin: '0 auto', marginTop: 15 }}>
          <SessionCard
            session={session}
            isUserFavorite={isUserFavorite}
            toggleUserFavoriteSession={toggleUserFavoriteSession}
          ></SessionCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SessionPage;
