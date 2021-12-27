import './Agenda.css';
import { useEffect, useState } from 'react';
import { DataStore } from 'aws-amplify';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonListHeader,
  IonSkeletonText
} from '@ionic/react';

import { Session } from '../models';

const Agenda: React.FC = () => {
  const [sessions, setSessions] = useState(new Array<Session>());

  useEffect(() => {
    DataStore.query(Session).then(sessions => setSessions(sessions));
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Agenda</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen color="light">
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Agenda</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonList className="aList">
          <IonListHeader>
            <IonLabel>
              <h2>Sessions available</h2>
            </IonLabel>
          </IonListHeader>
          {sessions.length > 0 ? (
            sessions.map(session => (
              <IonItem key={session.id}>
                <IonLabel>
                  {session.name}
                  <p>{session.description}</p>
                </IonLabel>
              </IonItem>
            ))
          ) : (
            <IonItem>
              <IonLabel>
                <IonSkeletonText animated style={{ width: '60%' }} />
              </IonLabel>
            </IonItem>
          )}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Agenda;
