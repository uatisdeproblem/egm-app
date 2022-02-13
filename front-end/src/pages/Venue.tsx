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

import { Venue } from 'models/venue';
import { toastMessageDefaults } from '../utils';
import { getVenue, isUserAdmin } from '../utils/data';

import VenueCard from '../components/VenueCard';

const VenuePage: React.FC = () => {
  const history = useHistory();
  const { venueId }: { venueId: string } = useParams();
  const [showMessage] = useIonToast();

  const [userIsAdmin, setUserIsAdmin] = useState(false);

  const [venue, setVenue] = useState<Venue>();

  useIonViewWillEnter(() => {
    loadData();
  }, []);

  const loadData = async (): Promise<void> => {
    setUserIsAdmin(await isUserAdmin());

    try {
      const venue = await getVenue(venueId);
      setVenue(venue);
    } catch (err) {
      await showMessage({ ...toastMessageDefaults, message: 'Venue not found.' });
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="ideaToolbar">
          <IonTitle className="ion-text-left">Venue details</IonTitle>
          <IonButtons slot="start">
            <IonButton onClick={() => history.goBack()}>
              <IonIcon icon={close} slot="icon-only"></IonIcon>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          {userIsAdmin ? (
            <p className="ion-text-right">
              <IonButton routerLink={'/manage/venue/' + venueId}>Manage</IonButton>
            </p>
          ) : (
            ''
          )}
          <VenueCard venue={venue}></VenueCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default VenuePage;
