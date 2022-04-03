import { useEffect, useRef, useState } from 'react';
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
import { addCircle, closeCircle } from 'ionicons/icons';

import { UserProfileShort } from 'models/userProfile';

import { cleanStrForSearches } from '../utils';
import { getUsers } from '../utils/data';

import UserProfileCard from '../components/UserProfileCard';

const PAGINATION_NUM_MAX_ELEMENTS = 24;

interface ContainerProps {
  cancel: () => void;
  select: (user: UserProfileShort) => void;
  selectIcon?: string;
  placeholder?: string;
  usersToHide?: UserProfileShort[];
}

const UsersList: React.FC<ContainerProps> = ({ cancel, select, selectIcon, placeholder, usersToHide }) => {
  const searchbar = useRef(null);

  const [users, setUsers] = useState<Array<UserProfileShort>>();
  const [filteredUsers, setFilteredUsers] = useState<Array<UserProfileShort>>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (): Promise<void> => {
    let users: UserProfileShort[];
    users = await getUsers();

    if (usersToHide) {
      const hideUsersWithId = new Set(usersToHide.map(x => x.userId));
      users = users.filter(x => !hideUsersWithId.has(x.userId));
    }

    setUsers(users);
    setFilteredUsers(users.slice(0, PAGINATION_NUM_MAX_ELEMENTS));
  };

  const filterUsers = (search = '', scrollToNextPage?: any): void => {
    const startPaginationAfterId = filteredUsers?.length ? filteredUsers[filteredUsers.length - 1].userId : null;

    let filteredList: UserProfileShort[];

    filteredList = (users || []).filter(x =>
      cleanStrForSearches(search)
        .toLowerCase()
        .split(' ')
        .every(searchTerm =>
          [cleanStrForSearches(x.getName()), x.ESNCountry, x.ESNSection].some(
            f => f && f.toLowerCase().includes(searchTerm)
          )
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
            <IonButton onClick={cancel}>
              <IonIcon icon={closeCircle} slot="icon-only"></IonIcon>
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
                  <IonButton fill="clear" color="ESNcyan" onClick={() => select(user)}>
                    <IonIcon icon={selectIcon || addCircle} slot="icon-only"></IonIcon>
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
