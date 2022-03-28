import { Auth } from '@aws-amplify/auth';
import { useEffect, useState } from 'react';
import { IonButton, IonIcon, IonInput, IonItem, IonLabel, useIonAlert, useIonToast } from '@ionic/react';
import { pencil } from 'ionicons/icons';

import { toastMessageDefaults } from '../utils';

const ChangeUserEmailComponent: React.FC = () => {
  const [showAlert] = useIonAlert();
  const [showMessage] = useIonToast();

  const [email, setEmail] = useState<string>();

  useEffect(() => {
    const loadData = async () => {
      const user = await Auth.currentAuthenticatedUser();
      setEmail(user.attributes.email);
    };
    loadData();
  }, []);

  const chooseNewLoginEmail = async (): Promise<void> => {
    const header = 'Change the login email';
    const message = 'To complete the procedure, you will receive a confirmation code at your new email address.';
    const inputs: any = [{ name: 'email', type: 'email', placeholder: 'yourNewEmail@test.com' }];
    const buttons = [
      { text: 'Cancel', role: 'cancel' },
      { text: 'Change', handler: ({ email }: { email: string }) => setNewLoginEmail(email) }
    ];
    await showAlert({ header, message, inputs, buttons });
  };
  const setNewLoginEmail = async (email: string): Promise<void> => {
    const user = await Auth.currentAuthenticatedUser();
    await Auth.updateUserAttributes(user, { email });
    await showMessage({ ...toastMessageDefaults, message: 'Confirmation email sent.', color: 'warning' });
    insertCodeToConfirmNewLoginEmail();
  };
  const insertCodeToConfirmNewLoginEmail = async (): Promise<void> => {
    const header = 'Login email change';
    const message = 'Insert the confirmation code you received at your new email address.';
    const inputs: any = [{ name: 'code', placeholder: '123456' }];
    const buttons = [
      { text: 'Cancel', role: 'cancel' },
      { text: 'Confirm', handler: ({ code }: { code: string }) => confirmNewLoginEmail(code) }
    ];
    await showAlert({ header, message, inputs, buttons });
  };
  const confirmNewLoginEmail = async (code: string): Promise<void> => {
    await Auth.verifyCurrentUserAttributeSubmit('email', code);
    await showMessage({ ...toastMessageDefaults, message: 'Email changed successfully.', color: 'success' });
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <IonItem color="white">
      <IonLabel position="stacked">Login and notifications email</IonLabel>
      <IonInput readonly value={email}></IonInput>
      <IonButton slot="end" fill="clear" color="medium" style={{ marginTop: 16 }} onClick={chooseNewLoginEmail}>
        <IonIcon icon={pencil} slot="icon-only"></IonIcon>
      </IonButton>
    </IonItem>
  );
};

export default ChangeUserEmailComponent;
