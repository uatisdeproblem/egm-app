import { Hub } from 'aws-amplify';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import {
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonItem,
  IonLabel,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonRow,
  IonTitle,
  IonToolbar,
  RefresherEventDetail,
  useIonToast
} from '@ionic/react';

import { CommunicationWithMarker } from 'models/communication';

import { isMobileMode, toastMessageDefaults } from '../utils';
import { getCommunications, markCommunicationAsRead } from '../utils/data';

import CommunicationCard from '../components/CommunicationCard';

const CommunicationsPage: React.FC = () => {
  const history = useHistory();
  const [showMessage] = useIonToast();

  const [communications, setCommunications] = useState<Array<CommunicationWithMarker>>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (): Promise<void> => {
    const communications = await getCommunications();
    setCommunications(communications);

    updateUnreadCommunicationsBadgeInTabBar(communications!);
  };
  const updateUnreadCommunicationsBadgeInTabBar = (communications: CommunicationWithMarker[]): void => {
    Hub.dispatch('communications', {
      event: 'setUnreadCommunications',
      data: { num: communications.filter(x => !x.hasBeenReadByUser).length }
    });
  };

  const refreshData = (event: CustomEvent<RefresherEventDetail>): void => {
    if (!event) return;

    setTimeout(async () => {
      await loadData();
      event.detail.complete();
    }, 100);
  };

  const openCommunication = async (communication: CommunicationWithMarker): Promise<void> => {
    if (!communication.hasBeenReadByUser) toggleReadMarker(communication);
    history.push('communication/' + communication.communicationId);
  };

  const toggleReadMarker = async (communication: CommunicationWithMarker): Promise<void> => {
    const markAsRead = !communication.hasBeenReadByUser;

    try {
      if (markAsRead) communication.hasBeenReadByUser = true;
      else delete communication.hasBeenReadByUser;

      setCommunications([...communications!]);
      updateUnreadCommunicationsBadgeInTabBar(communications!);

      await markCommunicationAsRead(communication, markAsRead);
    } catch (error) {
      await showMessage({ ...toastMessageDefaults, message: 'Operation failed.', color: 'danger' });
    }
  };

  return (
    <IonPage>
      <IonHeader>
        {isMobileMode() ? (
          <IonToolbar color="ideaToolbar">
            <IonTitle>News</IonTitle>
          </IonToolbar>
        ) : (
          ''
        )}
      </IonHeader>
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={refreshData}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
        {communications ? (
          <IonGrid style={{ maxWidth: 600, margin: '0 auto' }}>
            <IonRow className="ion-justify-content-center">
              {!communications ? (
                <IonCol>
                  <CommunicationCard></CommunicationCard>
                </IonCol>
              ) : communications && communications.length === 0 ? (
                <IonCol>
                  <IonItem lines="none" color="white">
                    <IonLabel className="ion-text-center">No communications yet.</IonLabel>
                  </IonItem>
                </IonCol>
              ) : (
                communications.map(communication => (
                  <IonCol key={communication.communicationId} size="12">
                    <CommunicationCard
                      communication={communication}
                      preview
                      select={() => openCommunication(communication)}
                      toggleMarkAsRead={() => toggleReadMarker(communication)}
                    ></CommunicationCard>
                  </IonCol>
                ))
              )}
            </IonRow>
          </IonGrid>
        ) : (
          ''
        )}
      </IonContent>
    </IonPage>
  );
};

export default CommunicationsPage;
