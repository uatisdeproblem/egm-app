import { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router';
import {
  IonButton,
  IonIcon,
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonList,
  IonSearchbar,
  IonItem,
  IonLabel,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
  IonRow,
  IonCol
} from '@ionic/react';
import { close, add } from 'ionicons/icons';

import { UserProfileSummary } from 'models/userProfile';

import { cleanStrForSearches } from '../utils';
import { getUsers } from '../utils/data';

import UserProfileCard from '../components/UserProfileCard';

const PAGINATION_NUM_MAX_ELEMENTS = 24;

interface ContainerProps {
  select: (user: UserProfileSummary) => void;
  selectIcon?: string;
  placeholder?: string;
}

const UsersList: React.FC<ContainerProps> = ({ select, selectIcon, placeholder }) => {
  const history = useHistory();

  const searchbar = useRef(null);

  const [users, setUsers] = useState<Array<UserProfileSummary>>();
  const [filteredUsers, setFilteredUsers] = useState<Array<UserProfileSummary>>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (): Promise<void> => {
    const users = await getUsers();
    setUsers(users);
    setFilteredUsers(users.slice(0, PAGINATION_NUM_MAX_ELEMENTS));
  };

  const filterUsers = (search = '', scrollToNextPage?: any): void => {
    const startPaginationAfterId = filteredUsers?.length ? filteredUsers[filteredUsers.length - 1].userId : null;

    let filteredList: UserProfileSummary[];

    filteredList = (users || []).filter(x =>
      cleanStrForSearches(search)
        .toLowerCase()
        .split(' ')
        .every(searchTerm =>
          [cleanStrForSearches(x.getName()), x.ESNCountry, x.ESNSection]
            .filter(x => x)
            .some(f => f.toLowerCase().includes(searchTerm))
        )
    );

    let indexOfLastOfPreviousPage = 0;

    if (scrollToNextPage && filteredList.length > PAGINATION_NUM_MAX_ELEMENTS)
      indexOfLastOfPreviousPage = filteredList.findIndex(x => x.userId === startPaginationAfterId) || 0;

    filteredList = filteredList.slice(0, indexOfLastOfPreviousPage + PAGINATION_NUM_MAX_ELEMENTS);

    if (scrollToNextPage) setTimeout(() => scrollToNextPage.complete(), 100);

    setFilteredUsers(filteredList);
  };

  const getSearchbarValue = (): string => (searchbar as any)?.current?.value;

  const refreshList = (event: CustomEvent<RefresherEventDetail>): void => {
    setTimeout(async (): Promise<void> => {
      await loadData();
      event.detail.complete();
    }, 100);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="ideaToolbar">
          <IonButtons slot="start">
            <IonButton onClick={() => history.goBack()}>
              <IonIcon icon={close} slot="icon-only"></IonIcon>
            </IonButton>
          </IonButtons>
          <IonSearchbar
            ref={searchbar}
            placeholder={placeholder}
            onIonChange={e => filterUsers(e.detail.value!)}
          ></IonSearchbar>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonRefresher slot="fixed" onIonRefresh={refreshList}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
        <IonList>
          <p className="ion-text-center">Note: only users with complete profiles are listed.</p>
          {!filteredUsers ? (
            <UserProfileCard></UserProfileCard>
          ) : filteredUsers && filteredUsers.length === 0 ? (
            <IonItem lines="none" color="white">
              <IonLabel className="ion-text-center">No users found.</IonLabel>
            </IonItem>
          ) : (
            filteredUsers.map(user => (
              <IonRow key={user.userId} className="ion-align-items-center">
                <IonCol size="10">
                  <UserProfileCard profile={user} noPopup></UserProfileCard>
                </IonCol>
                <IonCol size="2" className="ion-text-right">
                  <IonButton fill="clear" onClick={() => select(user)}>
                    <IonIcon icon={selectIcon || add} slot="icon-only"></IonIcon>
                  </IonButton>
                </IonCol>
              </IonRow>
            ))
          )}
          <IonInfiniteScroll onIonInfinite={event => filterUsers(getSearchbarValue(), event?.target)}>
            <IonInfiniteScrollContent></IonInfiniteScrollContent>
          </IonInfiniteScroll>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default UsersList;
