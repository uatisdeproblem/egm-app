import { useEffect, useState } from 'react';
import { IonButton, IonIcon, useIonAlert, useIonLoading, useIonToast } from '@ionic/react';
import { mail } from 'ionicons/icons';

import { Organization } from 'models/organization';
import { UserProfile } from 'models/userProfile';

import { getUserProfile, sendUserContactsToOrganization } from '../utils/data';
import { toastMessageDefaults } from '../utils';

interface ContainerProps {
  organization: Organization;
}

const ContactOrganizationButton: React.FC<ContainerProps> = ({ organization }) => {
  const [showAlert] = useIonAlert();
  const [showMessage] = useIonToast();
  const [showLoading, dismissLoading] = useIonLoading();

  const [userProfile, setUserProfile] = useState<UserProfile>();

  useEffect(() => {
    loadData();
  }, []);
  const loadData = async (): Promise<void> => {
    const userProfile = await getUserProfile();
    setUserProfile(userProfile);
  };

  const chooseUserContactsToSendToOrganization = async (): Promise<void> => {
    const header = 'Send your contacts';
    const message = 'Choose what to send about you to the organization';
    const inputs: any = [
      { name: 'Name', type: 'checkbox', label: 'Name', checked: true, disabled: true, value: 'name' },
      { name: 'Email', type: 'checkbox', label: 'Email', checked: true, disabled: true, value: 'email' },
      { name: 'Phone Nr.', type: 'checkbox', label: 'Phone Nr.', value: 'phone', disabled: !userProfile?.contactPhone },
      { name: 'CV', type: 'checkbox', label: 'CV', value: 'cv', disabled: !userProfile?.hasUploadedCV }
    ];
    const buttons = [
      { text: 'Cancel', role: 'cancel' },
      { text: 'Send', handler: (selectedInfo: string[]) => sendContactInfoToCompany(selectedInfo) }
    ];
    await showAlert({ header, message, inputs, buttons });
  };

  const sendContactInfoToCompany = async (contactInfoToSend: string[]): Promise<void> => {
    await showLoading();
    try {
      await sendUserContactsToOrganization(
        organization,
        contactInfoToSend.includes('phone'),
        contactInfoToSend.includes('cv')
      );

      await showMessage({ ...toastMessageDefaults, message: 'Contact info sent.', color: 'success' });
    } catch (e) {
      await showMessage({ ...toastMessageDefaults, message: 'Error submitting your info.', color: 'danger' });
    } finally {
      await dismissLoading();
    }
  };

  return userProfile ? (
    <IonButton onClick={chooseUserContactsToSendToOrganization}>
      I'd like to get in contact <IonIcon icon={mail} slot="end"></IonIcon>
    </IonButton>
  ) : (
    <></>
  );
};

export default ContactOrganizationButton;
