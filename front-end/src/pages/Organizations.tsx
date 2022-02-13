import { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonRow,
  IonSearchbar,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import { refresh } from 'ionicons/icons';

import { isMobileMode } from '../utils';
import { getOrganizations } from '../utils/data';
import { Organization } from 'models/organization';

import OrganizationCard from '../components/OrganizationCard';

const OrganizationsPage: React.FC = () => {
  const history = useHistory();

  const [organizations, setOrganizations] = useState(new Array<Organization>());
  const [filteredOrganizations, setFilteredOrganizations] = useState(new Array<Organization>());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (): Promise<void> => {
    const organizations = await getOrganizations();
    setOrganizations(organizations);
    setFilteredOrganizations(organizations);
  };

  const filterOrganizations = (search = ''): void => {
    let filteredOrganizations: Organization[];

    filteredOrganizations = organizations.filter(x =>
      search
        .split(' ')
        .every(searchTerm => [x.name, x.description || ''].some(f => f.toLowerCase().includes(searchTerm)))
    );

    setFilteredOrganizations(filteredOrganizations);
  };

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
        <IonList>
          <div style={{ maxWidth: 500, margin: '0 auto' }}>
            <IonRow className="ion-align-items-center">
              <IonCol size="10">
                <IonSearchbar
                  color="white"
                  placeholder="Filter by name..."
                  onIonChange={e => filterOrganizations(e.detail.value!)}
                ></IonSearchbar>
              </IonCol>
              <IonCol size="2" className="ion-text-center">
                <IonButton fill="clear" color="medium" onClick={loadData}>
                  <IonIcon icon={refresh} slot="icon-only"></IonIcon>
                </IonButton>
              </IonCol>
            </IonRow>
          </div>
          <IonGrid>
            <IonRow className="ion-justify-content-center">
              {!filteredOrganizations ? (
                <IonCol>
                  <OrganizationCard></OrganizationCard>
                </IonCol>
              ) : !filteredOrganizations.length ? (
                <IonCol>
                  <IonItem lines="none">
                    <IonLabel className="ion-text-center">No elements found.</IonLabel>
                  </IonItem>
                </IonCol>
              ) : (
                filteredOrganizations.map(organization => (
                  <IonCol key={organization.organizationId} size="12" sizeSm="6" sizeMd="4" sizeLg="3" sizeXl="2">
                    <OrganizationCard
                      organization={organization}
                      preview
                      select={() => history.push('organization/' + organization.organizationId)}
                    ></OrganizationCard>
                  </IonCol>
                ))
              )}
            </IonRow>
          </IonGrid>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default OrganizationsPage;
