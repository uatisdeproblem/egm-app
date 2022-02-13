import { useState } from 'react';
import { useParams, useHistory } from 'react-router';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonButtons,
  IonButton,
  useIonToast,
  useIonViewWillEnter
} from '@ionic/react';
import { close } from 'ionicons/icons';

import { Organization } from 'models/organization';
import { toastMessageDefaults } from '../utils';
import { getOrganization } from '../utils/data';

import OrganizationCard from '../components/OrganizationCard';

const OrganizationPage: React.FC = () => {
  const history = useHistory();
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
      <IonHeader>
        <IonToolbar color="ideaToolbar">
          <IonTitle className="ion-text-left">Organization details</IonTitle>
          <IonButtons slot="start">
            <IonButton onClick={() => history.goBack()}>
              <IonIcon icon={close} slot="icon-only"></IonIcon>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <OrganizationCard organization={organization}></OrganizationCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default OrganizationPage;
