import { useState } from 'react';
import { useParams } from 'react-router';
import { IonContent, IonPage, useIonToast, useIonViewWillEnter } from '@ionic/react';

import { Venue } from 'models/venue';
import { toastMessageDefaults } from '../utils';
import { getVenue } from '../utils/data';

import VenueCard from '../components/VenueCard';
import EntityHeader from '../components/EntityHeader';

const VenuePage: React.FC = () => {
  const { venueId }: { venueId: string } = useParams();
  const [showMessage] = useIonToast();

  const [venue, setVenue] = useState<Venue>();

  useIonViewWillEnter(() => {
    loadData();
  }, []);

  const loadData = async (): Promise<void> => {
    try {
      const venue = await getVenue(venueId);
      setVenue(venue);
    } catch (err) {
      await showMessage({ ...toastMessageDefaults, message: 'Venue not found.' });
    }
  };

  return (
    <IonPage>
      <EntityHeader title="Venue details" type="venue" id={venueId}></EntityHeader>
      <IonContent>
        <div className="cardContainer">
          <VenueCard venue={venue}></VenueCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default VenuePage;
