import { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import {
  IonButton,
  IonIcon,
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonList,
  IonRow,
  IonCol,
  IonGrid,
  useIonToast,
  useIonAlert,
  useIonModal
} from '@ionic/react';
import { close, personAdd, removeCircleOutline, ribbon } from 'ionicons/icons';

import { UserProfileSummary } from 'models/userProfile';

import { addUserToAdminsById, getAdmins, removeUserFromAdminsById } from '../utils/data';

import UserProfileCard from '../components/UserProfileCard';
import UsersList from '../components/UsersList';
import { toastMessageDefaults } from '../utils';

const ManageAdminsPage: React.FC = () => {
  const history = useHistory();

  const [showMessage] = useIonToast();
  const [showAlert] = useIonAlert();

  const [admins, setAdmins] = useState<Array<UserProfileSummary>>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (): Promise<void> => {
    const admins = await getAdmins();
    setAdmins(admins);
  };

  const removeUserFromAdmins = async (user: UserProfileSummary): Promise<void> => {
    await removeUserFromAdminsById(user.userId);
    if (admins) {
      admins.splice(admins.indexOf(user), 1);
      setAdmins([...admins]);
    }
  };
  const askAndRemoveUserFromAdmins = async (user: UserProfileSummary): Promise<void> => {
    const header = 'Remove user from admins';
    const message = 'Are you sure?';
    const buttons = [
      { text: 'Cancel', role: 'cancel' },
      { text: 'Remove', handler: () => removeUserFromAdmins(user) }
    ];
    await showAlert({ header, message, buttons });
  };

  const addUserToAdmins = async (user: UserProfileSummary): Promise<void> => {
    dismissShowUsersListModal();

    if (!user) return;

    if (admins!.some(x => x.userId === user.userId))
      return await showMessage({ ...toastMessageDefaults, message: 'User is already admin.', color: 'warning' });

    await addUserToAdminsById(user.userId);
    if (admins) {
      admins.unshift(user);
      setAdmins([...admins]);
    }
  };

  const [showUsersListModal, dismissShowUsersListModal] = useIonModal(UsersList, {
    select: addUserToAdmins,
    placeholder: 'Find a user to be administrator',
    selectIcon: ribbon
  });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="ideaToolbar">
          <IonButtons slot="start">
            <IonButton onClick={() => history.goBack()}>
              <IonIcon icon={close} slot="icon-only"></IonIcon>
            </IonButton>
          </IonButtons>
          <IonTitle>Manage administrators</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => showUsersListModal()}>
              <IonIcon icon={personAdd} slot="icon-only"></IonIcon>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonList style={{ maxWidth: 500, margin: '0 auto' }}>
          {!admins ? (
            <UserProfileCard></UserProfileCard>
          ) : (
            <IonGrid className="ion-no-padding">
              {admins.map(admin => (
                <IonRow key={admin.userId} className="ion-align-items-center">
                  <IonCol size="10">
                    <UserProfileCard profile={admin} noPopup></UserProfileCard>
                  </IonCol>
                  <IonCol size="2" className="ion-text-right">
                    <IonButton fill="clear" color="danger" onClick={() => askAndRemoveUserFromAdmins(admin)}>
                      <IonIcon icon={removeCircleOutline} slot="icon-only"></IonIcon>
                    </IonButton>
                  </IonCol>
                </IonRow>
              ))}
            </IonGrid>
          )}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default ManageAdminsPage;
