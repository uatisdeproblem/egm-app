import { useEffect, useState } from 'react';
import {
  IonButton,
  IonIcon,
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonList,
  IonItem,
  IonLabel,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonRow,
  IonCol,
  IonSegment,
  IonSegmentButton,
  useIonLoading,
  useIonToast
} from '@ionic/react';
import { checkmarkCircle, closeCircle, removeCircle } from 'ionicons/icons';

import { ConnectionWithUserData } from 'models/connection';

import { toastMessageDefaults } from '../utils';
import { confirmConnectionRequestWithUserId, deleteConnection } from '../utils/data';

import UserProfileCard from '../components/UserProfileCard';

const PAGINATION_NUM_MAX_ELEMENTS = 24;

interface ContainerProps {
  dismiss: () => void;
  sent: ConnectionWithUserData[];
  received: ConnectionWithUserData[];
}

const UsersPendingConnections: React.FC<ContainerProps> = ({ dismiss, sent, received }) => {
  const [showLoading, dismissLoading] = useIonLoading();
  const [showMessage] = useIonToast();

  const [segment, setSegment] = useState('received');

  const [paginatedConnections, setPaginatedConnections] = useState<Array<ConnectionWithUserData>>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (): Promise<void> => {
    paginateUsers(segment);
  };

  const paginateUsers = (segment: string, scrollToNextPage?: any): void => {
    const startPaginationAfterId = paginatedConnections?.length
      ? paginatedConnections[paginatedConnections.length - 1].connectionId
      : null;

    let filteredList: ConnectionWithUserData[];

    filteredList = ((segment === 'received' ? received : sent) || []).slice();
    let indexOfLastOfPreviousPage = 0;

    if (scrollToNextPage && filteredList.length > PAGINATION_NUM_MAX_ELEMENTS)
      indexOfLastOfPreviousPage = filteredList.findIndex(x => x.connectionId === startPaginationAfterId) || 0;

    filteredList = filteredList.slice(0, indexOfLastOfPreviousPage + PAGINATION_NUM_MAX_ELEMENTS);

    if (scrollToNextPage) setTimeout(() => scrollToNextPage.complete(), 100);

    setPaginatedConnections(filteredList);
  };

  const changeSegment = (segment: string): void => {
    setSegment(segment);
    paginateUsers(segment);
  };

  const confirmConnectionFn = async (connection: ConnectionWithUserData): Promise<void> => {
    await showLoading();
    try {
      await confirmConnectionRequestWithUserId(connection.requesterId);

      received.splice(received.indexOf(connection), 1);

      paginateUsers(segment);

      await showMessage({ ...toastMessageDefaults, message: 'Connection confirmed.', color: 'success' });
    } catch (e) {
      await showMessage({
        ...toastMessageDefaults,
        message: 'Operation failed; please, try again',
        color: 'danger'
      });
    } finally {
      await dismissLoading();
    }
  };
  const deleteConnectionFn = async (connection: ConnectionWithUserData): Promise<void> => {
    await showLoading();
    try {
      await deleteConnection(connection);

      if (segment === 'received') received.splice(received.indexOf(connection), 1);
      else sent.splice(sent.indexOf(connection), 1);

      paginateUsers(segment);

      await showMessage({ ...toastMessageDefaults, message: 'Connection canceled.', color: 'dark' });
    } catch (e) {
      await showMessage({
        ...toastMessageDefaults,
        message: 'Operation failed; please, try again',
        color: 'danger'
      });
    } finally {
      await dismissLoading();
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="ideaToolbar">
          <IonButtons slot="start">
            <IonButton onClick={dismiss}>
              <IonIcon icon={closeCircle} slot="icon-only"></IonIcon>
            </IonButton>
          </IonButtons>
          <IonSegment value={segment}>
            <IonSegmentButton value="received" onClick={() => changeSegment('received')}>
              Received
            </IonSegmentButton>
            <IonSegmentButton value="sent" onClick={() => changeSegment('sent')}>
              Sent
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          {!paginatedConnections || paginatedConnections.length === 0 ? (
            <IonItem lines="none" color="white">
              <IonLabel className="ion-text-center">No pending connections.</IonLabel>
            </IonItem>
          ) : (
            paginatedConnections.map(connection => (
              <IonRow key={connection.connectionId} className="ion-align-items-center">
                <IonCol size="8" sizeMd="9">
                  <UserProfileCard profile={connection.userProfile}></UserProfileCard>
                </IonCol>
                <IonCol size="4" sizeMd="3" className="ion-text-center">
                  <IonButton fill="clear" color="danger" onClick={() => deleteConnectionFn(connection)}>
                    <IonIcon icon={removeCircle} slot="icon-only"></IonIcon>
                  </IonButton>
                  {segment === 'received' ? (
                    <IonButton fill="clear" color="success" onClick={() => confirmConnectionFn(connection)}>
                      <IonIcon icon={checkmarkCircle} slot="icon-only"></IonIcon>
                    </IonButton>
                  ) : (
                    ''
                  )}
                </IonCol>
              </IonRow>
            ))
          )}
          <IonInfiniteScroll onIonInfinite={event => paginateUsers(segment, event?.target)}>
            <IonInfiniteScrollContent></IonInfiniteScrollContent>
          </IonInfiniteScroll>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default UsersPendingConnections;
