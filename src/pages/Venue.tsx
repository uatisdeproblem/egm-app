import { useEffect, useState } from 'react';
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
  useIonToast
} from '@ionic/react';
import { close } from 'ionicons/icons';

import { Venue } from '../models';
import { toastMessageDefaults } from '../utils';
import { getVenue } from '../utils/data';

import VenueCard from '../components/VenueCard';

const VenuePage: React.FC = () => {
  const history = useHistory();
  const { venueId }: { venueId: string } = useParams();
  const [showMessage] = useIonToast();

  const [venue, setVenue] = useState<Venue>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (): Promise<void> => {
    const venue = await getVenue(venueId);
    if (!venue) {
      await showMessage({ ...toastMessageDefaults, message: 'Venue not found.' });
      return;
    }

    setVenue(venue);
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
          <VenueCard venue={venue}></VenueCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default VenuePage;
