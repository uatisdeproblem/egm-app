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
import { idCard, personAdd } from 'ionicons/icons';

import { UserProfile } from 'models/userProfile';

import { getConnections } from '../utils/data';

import UserProfileCard from '../components/UserProfileCard';
import Searchbar from '../components/Searchbar';

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

  const [showPopover, dismissPopover] = useIonPopover(UserProfileCard, {
    profile,
    showDetails: true,
    showQRCode: true,
    onHide: () => dismissPopover()
  });
  const openUserCard = (event: any) => showPopover({ event, cssClass: 'widePopover' });
  return (
    <IonGrid>
      <IonRow>
        <IonCol className="ion-text-center">
          <IonButton fill="clear" color="dark" onClick={openUserCard}>
            Share your social card <IonIcon icon={idCard} slot="end"></IonIcon>
          </IonButton>
          <IonButton>
            Add a connection <IonIcon icon={personAdd} slot="end"></IonIcon>
          </IonButton>
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol>
          <Searchbar
            placeholder="Filter by name, ESN country..."
            filterFn={filterConnections}
            ref={searchbar}
          ></Searchbar>
        </IonCol>
      </IonRow>
      <IonRow className="ion-justify-content-start">
        {!filteredConnections ? (
          [0, 1, 2, 3].map(x => (
            <IonCol key={x} size="12" sizeMd="6" sizeLg="4" sizeXl="3">
              <UserProfileCard></UserProfileCard>
            </IonCol>
          ))
        ) : filteredConnections && filteredConnections.length === 0 ? (
          <IonCol>
            <IonItem lines="none">
              <IonLabel className="ion-text-center">No connections found.</IonLabel>
            </IonItem>
          </IonCol>
        ) : (
          filteredConnections.map(user => (
            <IonCol key={user.userId} size="12" sizeMd="6" sizeLg="4" sizeXl="3">
              <UserProfileCard profile={user}></UserProfileCard>
            </IonCol>
          ))
        )}
      </IonRow>
      <IonRow>
        <IonCol>
          <IonInfiniteScroll
            onIonInfinite={event => filterConnections((searchbar as any)?.current?.value, event?.target)}
          >
            <IonInfiniteScrollContent></IonInfiniteScrollContent>
          </IonInfiniteScroll>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default UserConnectionsComponent;
