import { useState } from 'react';
import { IonContent, IonPage, useIonToast, useIonViewWillEnter, useIonLoading, IonButton, IonAlert } from '@ionic/react';
import { getUserProfile } from '../utils/data';
import Auth from '@aws-amplify/auth';

import { Organization } from 'models/organization';
import { UserProfile } from 'models/userProfile';
import { toastMessageDefaults } from '../utils';
import { getOrganization, getURLPathResourceId } from '../utils/data';

import OrganizationCard from '../components/OrganizationCard';
import EntityHeader from '../components/EntityHeader';

const OrganizationPage: React.FC = () => {
  const [showMessage] = useIonToast();
  const [showLoading, dismissLoading] = useIonLoading();
  const [showAlert, setShowAlert] = useState(false);

  const [organization, setOrganization] = useState<Organization>();
  const [userProfile, setUserProfile] = useState<UserProfile>();

  useIonViewWillEnter(() => {
    loadData();
  }, []);
  const loadData = async (): Promise<void> => {
    try {
      const organizationId = getURLPathResourceId();
      const organization = await getOrganization(organizationId);
      const userProfile = await getUserProfile();

      setUserProfile(userProfile);
      setOrganization(organization);
    } catch (err) {
      await showMessage({ ...toastMessageDefaults, message: 'Organization not found.' });
    }
  };

  const submitContactInfo = async (options: Array<string>): Promise<void> => {

    const body: {
      [key: string]: boolean | string;
    } = {
      action: 'SEND_USER_CONTACTS',
      sendPhone: options.includes('phone'),
      sendCV: options.includes('cv')
    }

    if (!organization) return;

    await showLoading();
    try {
      if (!userProfile) return;

      if (!userProfile.contactEmail) {
        const user = await Auth.currentAuthenticatedUser();
        userProfile.contactEmail = user.attributes.email;
      }

      await fetch(`localhost:3000/organizations/${organization.organizationId}`, {
        method: "PATCH",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify(body)
      })

      await showMessage({ ...toastMessageDefaults, message: 'Contact info submitted.', color: 'success' });
    } catch (e) {
      await showMessage({ ...toastMessageDefaults, message: 'Error submitting your info.', color: 'danger' });
    } finally {
      await dismissLoading();
    }
  }

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
          <IonButton onClick={() => setShowAlert(true)} expand="block" style={{ marginTop: 20 }}>I'd like to get in contact</IonButton>
        </div>
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={'Choose info to send'}
          inputs={[
            {
              name: 'Name',
              type: 'checkbox',
              label: 'Name',
              checked: true,
              disabled: true,
              value: 'name'
            },
            {
              name: 'Email',
              type: 'checkbox',
              label: 'Email',
              checked: true,
              disabled: true,
              value: 'email'
            },
            {
              name: 'Phone Nr.',
              type: 'checkbox',
              label: 'Phone Nr.',
              value: 'phone',
              disabled: !userProfile?.contactPhone
            },
            {
              name: 'CV',
              type: 'checkbox',
              label: 'CV',
              value: 'cv',
              disabled: !userProfile?.hasUploadedCV
            }
          ]}
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel',
              cssClass: 'secondary'
            },
            {
              text: 'Submit',
              handler: (inputData) => {
                submitContactInfo(inputData);
              }
            }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default OrganizationPage;
