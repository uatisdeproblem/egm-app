import { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonSkeletonText,
  IonToolbar
} from '@ionic/react';
import { navigate } from 'ionicons/icons';

import { Venue } from 'models/venue';
import { UserProfile } from 'models/userProfile';

import { isMobileMode, openGeoLocationInMap } from '../utils';
import { getUserProfile, getVenues } from '../utils/data';

import MapBox from '../components/MapBox';
import Searchbar from '../components/Searchbar';
import SetUserHomeAddressButton from '../components/SetUserHomeAddressButton';

const VenuesPage: React.FC = () => {
  const history = useHistory();
  const [segment, setSegment] = useState('map');
  const mapRef = useRef();

  const [venues, setVenues] = useState<Array<Venue>>();
  const [filteredVenues, setFilteredVenues] = useState<Array<Venue>>();

  const [userProfile, setUserProfile] = useState<UserProfile>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (): Promise<void> => {
    const venues = await getVenues();
    const userProfile = await getUserProfile();

    if (userProfile.homeAddress) {
      venues.unshift(
        new Venue({
          venueId: 'home',
          name: 'Home',
          address: userProfile.homeAddress,
          longitude: userProfile.homeLongitude,
          latitude: userProfile.homeLatitude
        })
      );
    }

    setVenues(venues);
    setFilteredVenues(venues);
    setUserProfile(userProfile);
  };

  const filterVenues = (search = ''): void => {
    let filteredVenues: Venue[];

    filteredVenues = (venues || []).filter(x =>
      search
        .toLowerCase()
        .split(' ')
        .every(searchTerm =>
          [x.name, x.description, x.address].filter(x => x).some(f => f.toLowerCase().includes(searchTerm))
        )
    );

    setFilteredVenues(filteredVenues);
  };

  const selectVenue = (venue: Venue): void => {
    if (venue.venueId === 'home') return;

    if (isMobileMode()) history.push('venue/' + venue.venueId);
    else {
      const map = mapRef.current as any;
      map.selectVenue(venue);
    }
  };

  const navigateToVenue = (venue: Venue, event: any): void => {
    if (event) event.stopPropagation();
    openGeoLocationInMap(venue.latitude, venue.longitude);
  };

  return (
    <IonPage>
      <IonHeader>
        {isMobileMode() ? (
          <IonToolbar color="ideaToolbar">
            <IonSegment value={segment}>
              <IonSegmentButton value="map" onClick={() => setSegment('map')}>
                Map
              </IonSegmentButton>
              <IonSegmentButton value="list" onClick={() => setSegment('list')}>
                List
              </IonSegmentButton>
            </IonSegment>
          </IonToolbar>
        ) : (
          ''
        )}
      </IonHeader>
      <IonContent>
        {venues ? (
          <>
            <div
              style={
                isMobileMode() ? { display: segment !== 'list' ? 'none' : 'inherit' } : { width: '30%', float: 'left' }
              }
            >
              <IonList lines="inset" style={{ padding: 0, maxWidth: 500, margin: '0 auto' }}>
                {userProfile && !userProfile.homeAddress ? (
                  <div className="ion-padding">
                    <SetUserHomeAddressButton
                      userProfile={userProfile}
                      setFn={() => window.location.reload()}
                    ></SetUserHomeAddressButton>
                  </div>
                ) : (
                  ''
                )}
                <Searchbar placeholder="Filter venues..." filterFn={filterVenues} refreshFn={loadData}></Searchbar>
                {!filteredVenues ? (
                  <IonItem color="white">
                    <IonLabel>
                      <IonSkeletonText animated></IonSkeletonText>
                    </IonLabel>
                  </IonItem>
                ) : !filteredVenues.length ? (
                  <IonItem lines="none">
                    <IonLabel className="ion-text-center">No venues found</IonLabel>
                  </IonItem>
                ) : (
                  filteredVenues.map(venue => (
                    <IonItem
                      color="white"
                      key={venue.venueId}
                      button={venue.venueId !== 'home'}
                      onClick={() => selectVenue(venue)}
                    >
                      <IonLabel class="ion-text-wrap">{venue.name}</IonLabel>
                      <IonButton slot="end" fill="clear" onClick={event => navigateToVenue(venue, event)}>
                        <IonIcon icon={navigate} slot="icon-only"></IonIcon>
                      </IonButton>
                      {venue.venueId === 'home' && userProfile?.homeAddress ? (
                        <SetUserHomeAddressButton
                          mini={true}
                          userProfile={userProfile}
                          setFn={() => window.location.reload()}
                        ></SetUserHomeAddressButton>
                      ) : (
                        ''
                      )}
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
          </>
        ) : (
          ''
        )}
      </IonContent>
    </IonPage>
  );
};

export default VenuesPage;
