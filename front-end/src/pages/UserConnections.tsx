import { useEffect, useRef, useState } from 'react';
import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonItem,
  IonLabel,
  IonModal,
  IonRow
} from '@ionic/react';

import { UserProfile } from 'models/userProfile';

import { getConnections } from '../utils/data';

import UserProfileCard from '../components/UserProfileCard';
import Searchbar from '../components/Searchbar';

const PAGINATION_NUM_MAX_ELEMENTS = 48;

const UserConnectionsComponent: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

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

  return (
    <>
      <IonButton id="trigger-button" onClick={() => setShowModal(true)}>
        Click to connect with someone!
      </IonButton>
      <IonModal isOpen={showModal} trigger="trigger-button">
        <IonContent>Ciao</IonContent>
      </IonModal>
      <IonGrid>
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
            <IonCol size="12" sizeMd="6" sizeLg="4" sizeXl="3">
              <UserProfileCard></UserProfileCard>
            </IonCol>
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
      </IonGrid>
      <IonInfiniteScroll onIonInfinite={event => filterConnections((searchbar as any)?.current?.value, event?.target)}>
        <IonInfiniteScrollContent></IonInfiniteScrollContent>
      </IonInfiniteScroll>
    </>
  );
};

export default UserConnectionsComponent;
