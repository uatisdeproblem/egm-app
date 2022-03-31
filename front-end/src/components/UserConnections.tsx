import { useEffect, useRef, useState } from 'react';
import {
  IonButton,
  IonCol,
  IonGrid,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonItem,
  IonLabel,
  IonRow,
  useIonPopover
} from '@ionic/react';
import { idCard } from 'ionicons/icons';

import { UserProfile } from 'models/userProfile';

import { getConnections } from '../utils/data';

import UserProfileCard from '../components/UserProfileCard';
import Searchbar from '../components/Searchbar';
import AddConnectionButton from './AddConnectionButton';

const PAGINATION_NUM_MAX_ELEMENTS = 48;

interface ContainerProps {
  profile: UserProfile;
}

const UserConnectionsComponent: React.FC<ContainerProps> = ({ profile }) => {
  const [connections, setConnections] = useState<UserProfile[]>();
  const [filteredConnections, setFilteredConnections] = useState<Array<UserProfile>>();

  const searchbar = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      const connections = await getConnections();
      setConnections(connections);
      setFilteredConnections(connections.slice(0, PAGINATION_NUM_MAX_ELEMENTS));
    };
    loadData();
  }, []);

  const filterConnections = (search = '', scrollToNextPage?: any): void => {
    const startPaginationAfterId = filteredConnections?.length
      ? filteredConnections[filteredConnections.length - 1].userId
      : null;

    let filteredList: UserProfile[];

    filteredList = (connections || []).filter(x =>
      search
        .toLowerCase()
        .split(' ')
        .every(searchTerm =>
          [x.firstName, x.lastName, x.ESNCountry, x.ESNSection]
            .filter(x => x)
            .some(f => f.toLowerCase().includes(searchTerm))
        )
    );

    let indexOfLastOfPreviousPage = 0;

    if (scrollToNextPage && filteredList.length > PAGINATION_NUM_MAX_ELEMENTS)
      indexOfLastOfPreviousPage = filteredList.findIndex(x => x.userId === startPaginationAfterId) || 0;

    filteredList = filteredList.slice(0, indexOfLastOfPreviousPage + PAGINATION_NUM_MAX_ELEMENTS);

    if (scrollToNextPage) setTimeout(() => scrollToNextPage.complete(), 100);

    setFilteredConnections(filteredList);
  };

  const [showUserCardPopover, dismissUserCardPopover] = useIonPopover(UserProfileCard, {
    profile,
    showDetails: true,
    isUserProfile: true,
    onHide: () => dismissUserCardPopover()
  });
  const openUserCard = (event: any) => showUserCardPopover({ event, cssClass: 'widePopover' });

  const newConnection = (connection: UserProfile): void => {
    if (!connections) return;

    connections.unshift(connection);
    setConnections(connections);

    filterConnections();
  };
  const deletedConnection = (connection: UserProfile): void => {
    if (!connections) return;

    connections.splice(connections.indexOf(connection), 1);
    setConnections(connections);

    filterConnections();
  };

  const getSearchbarValue = (): string => (searchbar as any)?.current?.value;

  return (
    <IonGrid>
      <IonRow>
        <IonCol className="ion-text-center ion-padding">
          <IonButton fill="clear" color="dark" onClick={openUserCard}>
            Open your social card <IonIcon icon={idCard} slot="end"></IonIcon>
          </IonButton>
          <AddConnectionButton newConnection={newConnection}></AddConnectionButton>
        </IonCol>
      </IonRow>
      {connections?.length ? (
        <IonRow>
          <IonCol>
            <Searchbar
              placeholder={'Filter your ' + connections.length + ' connections...'}
              filterFn={filterConnections}
              ref={searchbar}
            ></Searchbar>
          </IonCol>
        </IonRow>
      ) : (
        ''
      )}
      <IonRow className="ion-justify-content-center">
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
          filteredConnections.map(user => (
            <IonCol key={user.userId} size="12" sizeMd="6" sizeLg="4" sizeXl="3">
              <UserProfileCard profile={user} onDeletedConnection={() => deletedConnection(user)}></UserProfileCard>
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
    </IonGrid>
  );
};

export default UserConnectionsComponent;
