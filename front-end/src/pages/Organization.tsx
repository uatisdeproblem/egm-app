import { useState } from 'react';
import { useParams } from 'react-router';
import { IonContent, IonPage, useIonToast, useIonViewWillEnter } from '@ionic/react';

import { Organization } from 'models/organization';
import { toastMessageDefaults } from '../utils';
import { getOrganization } from '../utils/data';

import OrganizationCard from '../components/OrganizationCard';
import EntityHeader from '../components/EntityHeader';

const OrganizationPage: React.FC = () => {
  const { organizationId }: { organizationId: string } = useParams();
  const [showMessage] = useIonToast();

  const [organization, setOrganization] = useState<Organization>();

  useIonViewWillEnter(() => {
    loadData();
  }, []);

  const loadData = async (): Promise<void> => {
    try {
      const organization = await getOrganization(organizationId);
      setOrganization(organization);
    } catch (err) {
      await showMessage({ ...toastMessageDefaults, message: 'Organization not found.' });
    }
  };

  return (
    <IonPage>
      <EntityHeader title="Organization details" type="organization" id={organizationId}></EntityHeader>
      <IonContent>
        <div className="cardContainer">
          <OrganizationCard organization={organization}></OrganizationCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default OrganizationPage;
