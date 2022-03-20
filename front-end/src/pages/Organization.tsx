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

    let info: {
      [key: string]: string | boolean | undefined;
    } = {
      name: undefined,
      email: undefined,
      phone: undefined,
      hasCV: undefined
    };

    const optionMappers: {
      [key: string]: Function;
    } = {
      name: (obj: any, profile: any): object => {
        const { firstName, lastName} = profile;
        obj.name = `${firstName} ${lastName}`;
        return obj;
      },
      email: (obj: any, profile: any): object => {
        const {contactEmail} = profile;
        obj.email = contactEmail;
        return obj;
      },
      phone: (obj: any, profile: any): object => {
        const {contactPhone} = profile;
        obj.phone = contactPhone;
        return obj;
      },
      cv: (obj: any, profile: any): object => {
        const {hasUploadedCV} = profile;
        // if the field was checked we will check if the user has a CV before fetching it to avoid errors
        obj.hasCV = hasUploadedCV;
        return obj;
      }
    }

    if (!organization) return;

    await showLoading();
    try {
      if (!userProfile) return;

      if (!userProfile.contactEmail) {
        const user = await Auth.currentAuthenticatedUser();
        userProfile.contactEmail = user.attributes.email;
      }

      options.map(option => info = optionMappers[option](info, userProfile))

      if (info.hasCV) {
        // if user has a CV how do we fetch it and attach it to the email?
      }

      // at confirmation an email will be sent to contactEmail

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
