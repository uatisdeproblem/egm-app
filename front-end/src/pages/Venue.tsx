import { useState } from 'react';
import { useHistory } from 'react-router';
import {
  IonCol,
  IonContent,
  IonGrid,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonPage,
  IonRow,
  useIonToast,
  useIonViewWillEnter
} from '@ionic/react';

import { Venue } from 'models/venue';
import { Room } from 'models/room';

import { toastMessageDefaults } from '../utils';
import { getRooms, getURLPathResourceId, getVenue } from '../utils/data';

import EntityHeader from '../components/EntityHeader';
import VenueCard from '../components/VenueCard';
import Searchbar from '../components/Searchbar';
import RoomCard from '../components/RoomCard';

const VenuePage: React.FC = () => {
  const history = useHistory();
  const [showMessage] = useIonToast();

  const [venue, setVenue] = useState<Venue>();
  const [rooms, setRooms] = useState<Array<Room>>();
  const [filteredRooms, setFilteredRooms] = useState<Array<Room>>();

  useIonViewWillEnter(() => {
    loadData();
  }, []);

  const loadData = async (): Promise<void> => {
    try {
      const venueId = getURLPathResourceId();
      const venue = await getVenue(venueId);
      const rooms = await getRooms(venue);

      setVenue(venue);
      setRooms(rooms);
      setFilteredRooms(rooms);
    } catch (err) {
      await showMessage({ ...toastMessageDefaults, message: 'Venue not found.' });
    }
  };

  const filterRooms = (search = ''): void => {
    let filteredRooms: Room[];

    filteredRooms = (rooms || []).filter(x =>
      search
        .split(' ')
        .every(searchTerm =>
          [x.name, x.internalLocation, x.description].filter(f => f).some(f => f.toLowerCase().includes(searchTerm))
        )
    );

    setFilteredRooms(filteredRooms);
  };

  return (
    <IonPage>
      <EntityHeader title="Venue details" type="venue" id={venue?.venueId || ''}></EntityHeader>
      <IonContent>
        <IonGrid className="contentGrid">
          <IonRow className="ion-justify-content-center">
            <IonCol size="12" sizeMd="6">
              <VenueCard venue={venue}></VenueCard>
            </IonCol>
            {rooms?.length ? (
              <IonCol size="12" sizeMd="6">
                <IonList>
                  <IonListHeader>
                    <IonLabel class="ion-text-center">
                      <h2>Venue's rooms</h2>
                    </IonLabel>
                  </IonListHeader>
                  <Searchbar placeholder="Filter by name..." filterFn={filterRooms}></Searchbar>
                  {!filteredRooms ? (
                    <IonCol>
                      <RoomCard preview></RoomCard>
                    </IonCol>
                  ) : filteredRooms && filteredRooms.length === 0 ? (
                    <IonCol>
                      <IonItem lines="none" color="white">
                        <IonLabel className="ion-text-center">No rooms found.</IonLabel>
                      </IonItem>
                    </IonCol>
                  ) : (
                    filteredRooms?.map(room => (
                      <RoomCard
                        key={room.roomId}
                        room={room}
                        preview
                        select={() => history.push('/room/' + room.roomId)}
                      ></RoomCard>
                    ))
                  )}
                </IonList>
              </IonCol>
            ) : (
              ''
            )}
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default VenuePage;
