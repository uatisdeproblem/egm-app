import { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router';
import {
  IonButton,
  IonCol,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonRow,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonSkeletonText,
  IonToolbar
} from '@ionic/react';
import { refresh } from 'ionicons/icons';

import { isMobileMode } from '../utils';
import { getVenues } from '../utils/data';
import { Venue } from 'models/venue';

import MapBox from '../components/MapBox';

const MapPage: React.FC = () => {
  const history = useHistory();
  const [segment, setSegment] = useState('map');
  const mapRef = useRef();

  const [venues, setVenues] = useState(new Array<Venue>());
  const [filteredVenues, setFilteredVenues] = useState(new Array<Venue>());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (): Promise<void> => {
    const venues = await getVenues();
    setVenues(venues);
    setFilteredVenues(venues);
  };

  const filterVenues = (search = ''): void => {
    let filteredVenues: Venue[];

    filteredVenues = venues.filter(x =>
      search
        .split(' ')
        .every(searchTerm => [x.name, x.description, x.address].some(f => f.toLowerCase().includes(searchTerm)))
    );

    setFilteredVenues(filteredVenues);
  };

  const selectVenue = (venue: Venue): void => {
    if (isMobileMode()) history.push('venue/' + venue.venueId);
    else {
      const map = mapRef.current as any;
      map.selectVenue(venue);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        {isMobileMode() ? (
          <IonToolbar color="ideaToolbar">
            <IonSegment scrollable value={segment}>
              <IonSegmentButton value="map" onClick={() => setSegment('map')}>
                Map
              </IonSegmentButton>
              <IonSegmentButton value="list" onClick={() => setSegment('list')}>
                Venues
              </IonSegmentButton>
            </IonSegment>
          </IonToolbar>
        ) : (
          ''
        )}
      </IonHeader>
      <IonContent>
        <div
          style={
            isMobileMode() ? { display: segment !== 'list' ? 'none' : 'inherit' } : { width: '30%', float: 'left' }
          }
        >
          <IonList style={{ padding: 0 }}>
            <IonRow className="ion-align-items-center">
              <IonCol size="10">
                <IonSearchbar
                  color="white"
                  placeholder="Filter venues..."
                  onIonChange={e => filterVenues(e.detail.value!)}
                ></IonSearchbar>
              </IonCol>
              <IonCol size="2" className="ion-text-center">
                <IonButton fill="clear" color="medium" onClick={loadData}>
                  <IonIcon icon={refresh} slot="icon-only"></IonIcon>
                </IonButton>
              </IonCol>
            </IonRow>
            {!filteredVenues ? (
              <IonItem color="white">
                <IonLabel>
                  <IonSkeletonText animated></IonSkeletonText>
                </IonLabel>
              </IonItem>
            ) : !filteredVenues.length ? (
              <IonItem lines="none">
                <IonLabel className="ion-text-center">No elements found</IonLabel>
              </IonItem>
            ) : (
              filteredVenues.map(venue => (
                <IonItem color="white" key={venue.venueId} button onClick={() => selectVenue(venue)}>
                  <IonLabel class="ion-text-wrap">{venue.name}</IonLabel>
                </IonItem>
              ))
            )}
          </IonList>
        </div>
        <div
          style={
            isMobileMode()
              ? { display: segment !== 'map' ? 'none' : 'inherit' }
              : { width: '70%', float: 'right', right: 0, position: 'fixed' }
          }
        >
          {venues.length ? (
            <MapBox id="main-map" venues={venues} ref={mapRef}></MapBox>
          ) : (
            <IonItem lines="none">
              <IonLabel>No venues to show.</IonLabel>
            </IonItem>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default MapPage;
