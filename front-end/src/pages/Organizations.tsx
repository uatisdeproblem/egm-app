import { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router';
import {
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonRow,
  IonTitle,
  IonToolbar
} from '@ionic/react';

import { isMobileMode } from '../utils';
import { getOrganizations } from '../utils/data';
import { Organization } from 'models/organization';

import OrganizationCard from '../components/OrganizationCard';
import Searchbar from '../components/Searchbar';

const PAGINATION_NUM_MAX_ELEMENTS = 24;

const OrganizationsPage: React.FC = () => {
  const history = useHistory();

  const searchbar = useRef(null);

  const [organizations, setOrganizations] = useState<Array<Organization>>();
  const [filteredOrganizations, setFilteredOrganizations] = useState<Array<Organization>>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (): Promise<void> => {
    const organizations = await getOrganizations();
    setOrganizations(organizations);
    setFilteredOrganizations(organizations.slice(0, PAGINATION_NUM_MAX_ELEMENTS));
  };

  const filterOrganizations = (search = '', scrollToNextPage?: any): void => {
    const startPaginationAfterId = filteredOrganizations?.length
      ? filteredOrganizations[filteredOrganizations.length - 1].organizationId
      : null;

    let filteredList: Organization[];

    filteredList = (organizations || []).filter(x =>
      search
        .split(' ')
        .every(searchTerm => [x.name, x.description].filter(x => x).some(f => f.toLowerCase().includes(searchTerm)))
    );

    let indexOfLastOfPreviousPage = 0;

    if (scrollToNextPage && filteredList.length > PAGINATION_NUM_MAX_ELEMENTS)
      indexOfLastOfPreviousPage = filteredList.findIndex(x => x.organizationId === startPaginationAfterId) || 0;

    filteredList = filteredList.slice(0, indexOfLastOfPreviousPage + PAGINATION_NUM_MAX_ELEMENTS);

    if (scrollToNextPage) setTimeout(() => scrollToNextPage.complete(), 100);

    setFilteredOrganizations(filteredList);
  };

  const getSearchbarValue = (): string => (searchbar as any)?.current?.value;

  return (
    <IonPage>
      <IonHeader>
        {isMobileMode() ? (
          <IonToolbar color="ideaToolbar">
            <IonTitle>Organizations</IonTitle>
          </IonToolbar>
        ) : (
          ''
        )}
      </IonHeader>
      <IonContent>
        {organizations ? (
          <IonList>
            <Searchbar
              placeholder="Filter by name..."
              filterFn={filterOrganizations}
              refreshFn={loadData}
              ref={searchbar}
            ></Searchbar>
            <IonGrid className="ion-no-padding">
              <IonRow className="ion-justify-content-center">
                {!filteredOrganizations ? (
                  <IonCol>
                    <OrganizationCard></OrganizationCard>
                  </IonCol>
                ) : filteredOrganizations && filteredOrganizations.length === 0 ? (
                  <IonCol>
                    <IonItem lines="none" color="white">
                      <IonLabel className="ion-text-center">No organizations found.</IonLabel>
                    </IonItem>
                  </IonCol>
                ) : (
                  filteredOrganizations.map(organization => (
                    <IonCol key={organization.organizationId} size="12" sizeSm="6" sizeMd="4" sizeLg="3">
                      <OrganizationCard
                        organization={organization}
                        preview
                        select={() => history.push('organization/' + organization.organizationId)}
                      ></OrganizationCard>
                    </IonCol>
                  ))
                )}
              </IonRow>
              <IonRow>
                <IonCol>
                  <IonInfiniteScroll onIonInfinite={event => filterOrganizations(getSearchbarValue(), event?.target)}>
                    <IonInfiniteScrollContent></IonInfiniteScrollContent>
                  </IonInfiniteScroll>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonList>
        ) : (
          ''
        )}
      </IonContent>
    </IonPage>
  );
};

export default OrganizationsPage;
