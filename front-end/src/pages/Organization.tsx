import { useState } from 'react';
import { useHistory } from 'react-router';
import {
  IonCol,
  IonContent,
  IonGrid,
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

import { toastMessageDefaults } from '../utils';
import { getOrganization, getSpeakers, getURLPathResourceId } from '../utils/data';

import EntityHeader from '../components/EntityHeader';
import OrganizationCard from '../components/OrganizationCard';
import SpeakerCard from '../components/SpeakerCard';

const OrganizationPage: React.FC = () => {
  const history = useHistory();
  const [showMessage] = useIonToast();

  const [organization, setOrganization] = useState<Organization>();
  const [speakers, setSpeakers] = useState<Array<Speaker>>();

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
    } catch (err) {
      await showMessage({ ...toastMessageDefaults, message: 'Organization not found.' });
    }
  };

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
              <IonCol size="12" sizeMd="6">
                <IonList>
                  <IonListHeader>
                    <IonLabel class="ion-text-center">
                      <h2>Organization's speakers</h2>
                    </IonLabel>
                  </IonListHeader>
                  {speakers.map(speaker => (
                    <SpeakerCard
                      key={speaker.speakerId}
                      speaker={speaker}
                      preview
                      select={() => history.push('/speaker/' + speaker.speakerId)}
                    ></SpeakerCard>
                  ))}
                </IonList>
              </IonCol>
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
