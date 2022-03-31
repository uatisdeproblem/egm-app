import { useRef, useState } from 'react';
import { useHistory } from 'react-router';
import {
  IonCol,
  IonContent,
  IonGrid,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonPage,
  IonRow,
  useIonToast,
  useIonViewWillEnter
} from '@ionic/react';

import { Organization } from 'models/organization';
import { Speaker } from 'models/speaker';

import { cleanStrForSearches, toastMessageDefaults } from '../utils';
import { getOrganization, getSpeakers, getURLPathResourceId } from '../utils/data';

import EntityHeader from '../components/EntityHeader';
import OrganizationCard from '../components/OrganizationCard';
import SpeakerCard from '../components/SpeakerCard';
import Searchbar from '../components/Searchbar';

const PAGINATION_NUM_MAX_ELEMENTS = 12;

const OrganizationPage: React.FC = () => {
  const history = useHistory();
  const searchbar = useRef(null);
  const [showMessage] = useIonToast();

  const [organization, setOrganization] = useState<Organization>();
  const [speakers, setSpeakers] = useState<Array<Speaker>>();
  const [filteredSpeakers, setFilteredSpeakers] = useState<Array<Speaker>>();

  useIonViewWillEnter(() => {
    loadData();
  }, []);
  const loadData = async (): Promise<void> => {
    try {
      const organizationId = getURLPathResourceId();
      const organization = await getOrganization(organizationId);
      const speakers = await getSpeakers(organization);

      setOrganization(organization);
      setSpeakers(speakers);
      setFilteredSpeakers(speakers.slice(0, PAGINATION_NUM_MAX_ELEMENTS));
    } catch (err) {
      await showMessage({ ...toastMessageDefaults, message: 'Organization not found.' });
    }
  };

  const filterSpeakers = (search = '', scrollToNextPage?: any): void => {
    const startPaginationAfterId = filteredSpeakers?.length
      ? filteredSpeakers[filteredSpeakers.length - 1].speakerId
      : null;

    let filteredList: Speaker[];

    filteredList = (speakers || []).filter(x =>
      cleanStrForSearches(search)
        .toLowerCase()
        .split(' ')
        .every(searchTerm =>
          [cleanStrForSearches(x.name), x.title, x.description]
            .filter(x => x)
            .some(f => f.toLowerCase().includes(searchTerm))
        )
    );

    let indexOfLastOfPreviousPage = 0;

    if (scrollToNextPage && filteredList.length > PAGINATION_NUM_MAX_ELEMENTS)
      indexOfLastOfPreviousPage = filteredList.findIndex(x => x.speakerId === startPaginationAfterId) || 0;

    filteredList = filteredList.slice(0, indexOfLastOfPreviousPage + PAGINATION_NUM_MAX_ELEMENTS);

    if (scrollToNextPage) setTimeout(() => scrollToNextPage.complete(), 100);

    setFilteredSpeakers(filteredList);
  };

  const getSearchbarValue = (): string => (searchbar as any)?.current?.value;

  return (
    <IonPage>
      <EntityHeader
        title="Organization details"
        type="organization"
        id={organization?.organizationId || ''}
      ></EntityHeader>
      <IonContent>
        <IonGrid className="contentGrid">
          <IonRow className="ion-justify-content-center">
            <IonCol size="12" sizeMd="6">
              <OrganizationCard organization={organization}></OrganizationCard>
            </IonCol>
            {speakers?.length ? (
              <>
                <IonCol size="12" sizeMd="6">
                  <IonList>
                    <IonListHeader>
                      <IonLabel class="ion-text-center">
                        <h2>Organization's speakers</h2>
                      </IonLabel>
                    </IonListHeader>
                    <Searchbar
                      placeholder="Filter by name..."
                      filterFn={filterSpeakers}
                      refreshFn={loadData}
                      ref={searchbar}
                    ></Searchbar>
                    {!filteredSpeakers ? (
                      <IonCol>
                        <OrganizationCard></OrganizationCard>
                      </IonCol>
                    ) : filteredSpeakers && filteredSpeakers.length === 0 ? (
                      <IonCol>
                        <IonItem lines="none" color="white">
                          <IonLabel className="ion-text-center">No speakers found.</IonLabel>
                        </IonItem>
                      </IonCol>
                    ) : (
                      filteredSpeakers.map(speaker => (
                        <SpeakerCard
                          key={speaker.speakerId}
                          speaker={speaker}
                          preview
                          select={() => history.push('/speaker/' + speaker.speakerId)}
                        ></SpeakerCard>
                      ))
                    )}
                  </IonList>
                </IonCol>
                <IonCol>
                  <IonInfiniteScroll onIonInfinite={event => filterSpeakers(getSearchbarValue(), event?.target)}>
                    <IonInfiniteScrollContent></IonInfiniteScrollContent>
                  </IonInfiniteScroll>
                </IonCol>
              </>
            ) : (
              ''
            )}
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default OrganizationPage;
