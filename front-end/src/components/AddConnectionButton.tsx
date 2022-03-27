import { IonButton, IonIcon, useIonAlert, useIonLoading, useIonToast } from '@ionic/react';
import { personAdd } from 'ionicons/icons';

import { UserProfile } from 'models/userProfile';

import { addConnection } from '../utils/data';
import { toastMessageDefaults } from '../utils';

interface ContainerProps {
  newConnection: (connection: UserProfile) => void;
}

const AddConnectionButton: React.FC<ContainerProps> = ({ newConnection }) => {
  const [showAlert] = useIonAlert();
  const [showMessage] = useIonToast();
  const [showLoading, dismissLoading] = useIonLoading();

  const chooseUsernameToCreateConnection = async (): Promise<void> => {
    const header = 'New connection';
    const message =
      "Enter the email address of the user you want to connect with. Note: it's the email address they use to sign in.";
    const inputs: any = [{ name: 'username', type: 'email', placeholder: 'email@test.com' }];
    const buttons = [
      { text: 'Cancel', role: 'cancel' },
      { text: 'Add', handler: ({ username }: { username: string }) => addByUsername(username) }
    ];
    await showAlert({ header, message, inputs, buttons });
  };

  const addByUsername = async (username: string): Promise<void> => {
    await showLoading();
    try {
      const connection = await addConnection(username);

      await showMessage({ ...toastMessageDefaults, message: 'Successfully connected.', color: 'success' });

      newConnection(connection);
    } catch (e) {
      await showMessage({
        ...toastMessageDefaults,
        message: (e as any).message,
        color: 'danger'
      });
    } finally {
      await dismissLoading();
    }
  };

  return (
    <IonButton onClick={() => chooseUsernameToCreateConnection()}>
      Add a connection <IonIcon icon={personAdd} slot="end"></IonIcon>
    </IonButton>
  );
};

export default AddConnectionButton;
