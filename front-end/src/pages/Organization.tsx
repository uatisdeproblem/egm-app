import { useState } from 'react';
import { useHistory } from 'react-router';
import { IonContent, IonLabel, IonList, IonListHeader, IonPage, useIonToast, useIonViewWillEnter } from '@ionic/react';

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
        <div className="cardContainer">
          <OrganizationCard organization={organization}></OrganizationCard>
        </div>
        {speakers?.length ? (
          <IonList style={{ maxWidth: 600, margin: '0 auto' }}>
            <IonListHeader>
              <IonLabel class="ion-text-center">
                <h1>Speakers</h1>
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
        ) : (
          ''
        )}
      </IonContent>
    </IonPage>
  );
};

export default OrganizationPage;
