import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { createMap } from 'maplibre-gl-js-amplify';
import 'maplibre-gl/dist/maplibre-gl.css';
import 'maplibre-gl-js-amplify/dist/public/amplify-map.css';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonIcon, IonPopover } from '@ionic/react';
import { eye, navigate } from 'ionicons/icons';

import { Venue } from 'models/venue';
import { createMapMarker, openGeoLocationInMap } from '../utils';

// ESN AISBL office
const DEFAULT_MAP_CENTER: [number, number] = [4.378551, 50.844578];

const MapBox = forwardRef(({ id, venues }: { id: string; venues: Venue[] }, ref) => {
  const [showPopover, setShowPopover] = useState(false);

  const [selectedVenue, setSelectedVenue] = useState<Venue | null>();
  const [map, setMap] = useState<any>();

  useEffect(() => {
    const initializeMap = async (): Promise<void> => {
      const mapOptions = { container: id, zoom: 11, center: DEFAULT_MAP_CENTER };
      if (venues.length) mapOptions.center = Venue.getCoordinates(venues[0]);

      const map = await createMap(mapOptions);

      map.on('load', () => {
        const style = getComputedStyle(document.documentElement);
        const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const primaryColor = style.getPropertyValue(isDarkMode ? '--ion-color-tertiary' : '--ion-color-primary');
        const secondaryColor = style.getPropertyValue('--ion-color-secondary');
        const homeColor = style.getPropertyValue('--ion-color-ESNpink');

        const inactiveMarker = createMapMarker(primaryColor);
        const activeMarker = createMapMarker(secondaryColor);
        map.addImage('inactive-marker', inactiveMarker, { pixelRatio: 2 });
        map.addImage('active-marker', activeMarker, { pixelRatio: 2 });

        map.addSource('venues', { type: 'geojson', data: mapVenuesToMaplibreFeatureCollection(venues) });
        map.addLayer({ id: 'venues', type: 'symbol', source: 'venues', layout: { 'icon-image': 'inactive-marker' } });

        map.on('mouseenter', 'venues', () => (map.getCanvas().style.cursor = 'pointer'));
        map.on('mouseleave', 'venues', () => (map.getCanvas().style.cursor = ''));

        const homeMarker = createMapMarker(homeColor, true);
        map.addImage('home-marker', homeMarker, { pixelRatio: 2 });
        const setHomeMarker = ['match', ['get', 'id'], 'home', 'home-marker', 'inactive-marker'];
        map.setLayoutProperty('venues', 'icon-image', setHomeMarker);

        map.on('click', 'venues', ({ point }: any) => {
          const markers = map.queryRenderedFeatures(point, { layers: ['venues'] });
          if (!markers.length) return;

          const venue = venues.find(v => v.venueId === markers[0].properties.id);
          if (venue) map.fire('openVenue', { venue });
        });

        map.on('openVenue', ({ venue }) => {
          if (!venue) return;

          const activeMarker = ['match', ['get', 'id'], venue.venueId, 'active-marker', 'inactive-marker'];
          map.setLayoutProperty('venues', 'icon-image', activeMarker);

          setSelectedVenue(venue);
          setShowPopover(true);
        });
        map.on('dismissPopover', () => {
          const resetMarkers = ['match', ['get', 'id'], 'home', 'home-marker', 'inactive-marker'];
          map.setLayoutProperty('venues', 'icon-image', resetMarkers);
          setSelectedVenue(null);
          setShowPopover(false);
        });
      });
      setMap(map);
    };

    initializeMap();

    return (): void => {
      if (map) map.remove();
    };
  }, []);

  useImperativeHandle(ref, (): any => ({
    selectVenue(venue: Venue): void {
      map.fire('openVenue', { venue });
    }
  }));

  return (
    <>
      <div id={id} className="fullheight-map" />
      <IonPopover isOpen={showPopover} onDidDismiss={() => map.fire('dismissPopover')}>
        <IonCard color="white" style={{ boxShadow: 'none', margin: 0, padding: 10, width: '100%' }}>
          <IonCardHeader>
            <IonCardTitle class="ion-text-center">{selectedVenue?.name}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p className="ion-text-center ion-padding">{selectedVenue?.address}</p>
            {selectedVenue?.venueId !== 'home' ? (
              <IonButton fill="clear" expand="block" href={`/venue/${selectedVenue?.venueId}`}>
                See details <IonIcon icon={eye} slot="end"></IonIcon>
              </IonButton>
            ) : (
              ''
            )}
            <IonButton
              fill="clear"
              expand="block"
              onClick={() => openGeoLocationInMap(selectedVenue!.latitude, selectedVenue!.longitude)}
            >
              Start navigation <IonIcon icon={navigate} slot="end"></IonIcon>
            </IonButton>
            <IonButton fill="clear" expand="block" color="medium" onClick={() => setShowPopover(false)}>
              Dismiss
            </IonButton>
          </IonCardContent>
        </IonCard>
      </IonPopover>
    </>
  );
});

export default MapBox;

const mapVenueToMaplibreFeature = (venue: Venue): any => ({
  type: 'Feature',
  geometry: { type: 'Point', coordinates: Venue.getCoordinates(venue) },
  properties: { id: venue.venueId, name: venue.name, address: venue.address }
});
const mapVenuesToMaplibreFeatureCollection = (venues: Venue[]): any => {
  return {
    type: 'FeatureCollection',
    features: venues.map(v => mapVenueToMaplibreFeature(v))
  };
};
