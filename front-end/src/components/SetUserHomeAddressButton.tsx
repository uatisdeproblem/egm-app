import { IonButton, IonIcon, useIonAlert, useIonLoading, useIonToast } from '@ionic/react';
import { home, pencil } from 'ionicons/icons';

import { UserProfile } from 'models/userProfile';

import { setUserHomeAddress } from '../utils/data';
import { toastMessageDefaults } from '../utils';

interface ContainerProps {
  userProfile: UserProfile;
  setFn: () => void;
  mini?: boolean;
}

const SetUserHomeAddressButton: React.FC<ContainerProps> = ({ userProfile, setFn, mini }) => {
  const [showAlert] = useIonAlert();
  const [showMessage] = useIonToast();
  const [showLoading, dismissLoading] = useIonLoading();

  const chooseHomeAddress = async (): Promise<void> => {
    const header = 'Home address';
    const message =
      "You can set an address to quickly find your hotel, flat, etc. in the map, compared to the event's venues";
    const inputs: any = [
      { name: 'address', placeholder: 'ABC Street, City XYZ, Country', value: userProfile.homeAddress }
    ];
    const buttons = [
      { text: 'Cancel', role: 'cancel' },
      { text: 'Set', handler: ({ address }: { address: string }) => setHomeAddress(address) }
    ];
    await showAlert({ header, message, inputs, buttons });
  };

  const setHomeAddress = async (address: string): Promise<void> => {
    await showLoading();
    try {
      await setUserHomeAddress(address);

      await showMessage({ ...toastMessageDefaults, message: 'Address set.', color: 'success' });

      setFn();
    } catch (e) {
      await showMessage({ ...toastMessageDefaults, message: 'Error finding the address.', color: 'danger' });
    } finally {
      await dismissLoading();
    }
  };

  return userProfile ? (
    <IonButton fill="clear" color="dark" expand={mini ? undefined : 'block'} onClick={chooseHomeAddress}>
      {mini ? (
        <IonIcon icon={pencil} slot="icon-only"></IonIcon>
      ) : (
        <>
          Set your home address <IonIcon icon={home} slot="end"></IonIcon>
        </>
      )}
    </IonButton>
  ) : (
    <></>
  );
};

export default SetUserHomeAddressButton;
