import { Hub } from 'aws-amplify';
import { useEffect, useRef, useState } from 'react';
import {
  IonBadge,
  IonButton,
  IonButtons,
  IonCol,
  IonGrid,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonItem,
  IonLabel,
  IonModal,
  IonRefresher,
  IonRefresherContent,
  IonRow,
  IonSearchbar,
  IonToolbar,
  RefresherEventDetail,
  useIonAlert,
  useIonLoading,
  useIonPopover,
  useIonToast
} from '@ionic/react';
import { balloon, idCard, personAdd } from 'ionicons/icons';

import { UserProfile, UserProfileShort, UserProfileSummary } from 'models/userProfile';
import { ConnectionWithUserData } from 'models/connection';

import { cleanStrForSearches, isMobileMode, toastMessageDefaults } from '../utils';
import { deleteConnection, getConnections, sendConnectionRequestToUserId } from '../utils/data';

import UserProfileCard from '../components/UserProfileCard';
import UsersList from './UsersList';
import UsersPendingConnections from './UsersPendingConnections';

const PAGINATION_NUM_MAX_ELEMENTS = 48;

interface ContainerProps {
  profile: UserProfile;
}

const UserConnectionsComponent: React.FC<ContainerProps> = ({ profile }) => {
  const [showAlert] = useIonAlert();
  const [showLoading, dismissLoading] = useIonLoading();
  const [showMessage] = useIonToast();
  const [showUsersListModal, setShowUsersListModal] = useState(false);
  const [showPendingConnectionsModal, setShowPendingConnectionsModal] = useState(false);

  const [connections, setConnections] = useState<ConnectionWithUserData[]>();
  const [filteredConnections, setFilteredConnections] = useState<Array<ConnectionWithUserData>>();

  const [connectionsPendingSent, setConnectionsPendingSent] = useState<ConnectionWithUserData[]>();
  const [connectionsPendingReceived, setConnectionsPendingReceived] = useState<ConnectionWithUserData[]>();

  const searchbar = useRef(null);

  useEffect(() => {
    loadData();
  }, []);
  const loadData = async () => {
    const connections = await getConnections();

    const confirmedConnections = connections.filter(x => !x.isPending);
    const pendingConnectionsSent = connections.filter(x => x.isPending && x.requesterId === profile.userId);
    const pendingConnectionsReceived = connections.filter(x => x.isPending && x.targetId === profile.userId);

    setConnections(confirmedConnections);
    setFilteredConnections(confirmedConnections.slice(0, PAGINATION_NUM_MAX_ELEMENTS));
    setConnectionsPendingSent(pendingConnectionsSent);
    setConnectionsPendingReceived(pendingConnectionsReceived);

    updatePendingConnectionsBadgeInTabBar(pendingConnectionsReceived.length);
  };
  const updatePendingConnectionsBadgeInTabBar = (numPendingConnectionsReceived: number): void => {
    Hub.dispatch('connections', { event: 'setPendingConnections', data: { num: numPendingConnectionsReceived } });
  };

  const filterConnections = (search = '', scrollToNextPage?: any): void => {
    const startPaginationAfterId = filteredConnections?.length
      ? filteredConnections[filteredConnections.length - 1].connectionId
      : null;

    let filteredList: ConnectionWithUserData[];

    filteredList = (connections || []).filter(x =>
      cleanStrForSearches(search)
        .toLowerCase()
        .split(' ')
        .every(searchTerm =>
          [cleanStrForSearches(x.userProfile.getName()), x.userProfile.ESNCountry, x.userProfile.ESNSection].some(
            f => f && f!.toLowerCase().includes(searchTerm)
          )
        )
    );

    let indexOfLastOfPreviousPage = 0;

    if (scrollToNextPage && filteredList.length > PAGINATION_NUM_MAX_ELEMENTS)
      indexOfLastOfPreviousPage = filteredList.findIndex(x => x.connectionId === startPaginationAfterId) || 0;

    filteredList = filteredList.slice(0, indexOfLastOfPreviousPage + PAGINATION_NUM_MAX_ELEMENTS);

    if (scrollToNextPage) setTimeout(() => scrollToNextPage.complete(), 100);

    setFilteredConnections(filteredList);
  };

  const [showUserCardPopover, dismissUserCardPopover] = useIonPopover(UserProfileCard, {
    profile: new UserProfileSummary(profile),
    showDetails: true,
    isUserProfile: true,
    onHide: () => dismissUserCardPopover()
  });
  const openUserCard = (event: any) => showUserCardPopover({ event, cssClass: 'widePopover' });

  const sendConnectionRequest = async (user: UserProfileShort): Promise<void> => {
    setShowUsersListModal(false);

    await showLoading();
    try {
      const connection = await sendConnectionRequestToUserId(user.userId);

      await showMessage({ ...toastMessageDefaults, message: 'Connection request sent.', color: 'success' });

      connections!.unshift(connection);
      connectionsPendingSent!.unshift(connection);
      setConnections([...connections!]);
      setConnectionsPendingSent([...connectionsPendingSent!]);
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

  const askConfirmationToDeleteConnection = async (connection: ConnectionWithUserData): Promise<void> => {
    const header = 'Delete connection';
    const message = 'Are you sure?';
    const buttons = [
      { text: 'Cancel', role: 'cancel' },
      { text: 'Delete', handler: () => deleteConnectionFn(connection) }
    ];
    await showAlert({ header, message, buttons });
  };

  const deleteConnectionFn = async (connection: ConnectionWithUserData): Promise<void> => {
    await showLoading();
    try {
      await deleteConnection(connection);

      await showMessage({ ...toastMessageDefaults, message: 'Connection removed.', color: 'success' });

      if (!connections) return;

      connections.splice(connections.indexOf(connection), 1);
      setConnections(connections);

      filterConnections();
    } catch (e) {
      await showMessage({ ...toastMessageDefaults, message: 'Error finding the user.', color: 'danger' });
    } finally {
      await dismissLoading();
    }
  };

  const getSearchbarValue = (): string => (searchbar as any)?.current?.value;

  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

  const refreshList = (event: CustomEvent<RefresherEventDetail>): void => {
    setTimeout(async (): Promise<void> => {
      await loadData();
      event.detail.complete();
    }, 100);
  };

  return (
    <>
      <IonToolbar color={isDarkMode ? 'light' : 'medium'}>
        {connections?.length ? (
          <IonSearchbar
            color="white"
            ref={searchbar}
            placeholder={'Filter your ' + connections.length + ' connections...'}
            onIonChange={e => filterConnections(e.detail.value!)}
          ></IonSearchbar>
        ) : (
          ''
        )}
        <IonButtons slot="end">
          <IonButton fill="clear" onClick={openUserCard} style={isMobileMode() ? { width: 70 } : {}}>
            {isMobileMode() ? '' : 'Your social card'}
            <IonIcon icon={idCard} slot={isMobileMode() ? 'icon-only' : 'end'}></IonIcon>
          </IonButton>
          <IonButton
            fill="clear"
            onClick={() => setShowPendingConnectionsModal(true)}
            style={isMobileMode() ? { width: 70 } : {}}
          >
            {isMobileMode() ? '' : 'Pending requests'}
            <IonIcon icon={balloon} slot={isMobileMode() ? 'icon-only' : 'end'}></IonIcon>
            {connectionsPendingReceived?.length ? (
              <IonBadge color="ESNcyan" style={{ marginLeft: 4, paddingRight: 6, paddingLeft: 6 }}>
                {connectionsPendingReceived.length}
              </IonBadge>
            ) : (
              ''
            )}
          </IonButton>
          <IonButton onClick={() => setShowUsersListModal(true)} style={isMobileMode() ? { width: 70 } : {}}>
            {isMobileMode() ? '' : 'New connection'}
            <IonIcon icon={personAdd} slot={isMobileMode() ? 'icon-only' : 'end'}></IonIcon>
          </IonButton>
        </IonButtons>
      </IonToolbar>
      <IonRefresher slot="fixed" onIonRefresh={refreshList}>
        <IonRefresherContent></IonRefresherContent>
      </IonRefresher>
      <IonGrid>
        <IonRow>
          {!filteredConnections ? (
            [0, 1, 2, 3].map(x => (
              <IonCol key={x} size="12" sizeMd="6" sizeLg="4" sizeXl="3">
                <UserProfileCard></UserProfileCard>
              </IonCol>
            ))
          ) : filteredConnections && filteredConnections.length === 0 ? (
            <IonCol>
              <IonItem lines="none" color="white">
                <IonLabel className="ion-text-center">No connections found.</IonLabel>
              </IonItem>
            </IonCol>
          ) : (
            filteredConnections.map(connection => (
              <IonCol key={connection.connectionId} size="12" sizeMd="6" sizeLg="4" sizeXl="3">
                <UserProfileCard
                  profile={connection.userProfile}
                  deleteConnection={() => askConfirmationToDeleteConnection(connection)}
                ></UserProfileCard>
              </IonCol>
            ))
          )}
        </IonRow>
        <IonRow>
          <IonCol>
            <IonInfiniteScroll onIonInfinite={event => filterConnections(getSearchbarValue(), event?.target)}>
              <IonInfiniteScrollContent></IonInfiniteScrollContent>
            </IonInfiniteScroll>
          </IonCol>
        </IonRow>
        <IonModal isOpen={showUsersListModal} onDidDismiss={() => setShowUsersListModal(false)}>
          <UsersList
            cancel={() => setShowUsersListModal(false)}
            select={sendConnectionRequest}
            placeholder="Find a user to connect"
            usersToHide={[
              { userProfile: profile },
              ...(connections || []),
              ...(connectionsPendingSent || []),
              ...(connectionsPendingReceived || [])
            ].map(x => x.userProfile)}
          ></UsersList>
        </IonModal>
        <IonModal
          isOpen={showPendingConnectionsModal}
          onDidDismiss={() => {
            setShowPendingConnectionsModal(false);
            loadData();
          }}
        >
          <UsersPendingConnections
            dismiss={() => setShowPendingConnectionsModal(false)}
            sent={connectionsPendingSent || []}
            received={connectionsPendingReceived || []}
          ></UsersPendingConnections>
        </IonModal>
      </IonGrid>
    </>
  );
};

export default UserConnectionsComponent;
