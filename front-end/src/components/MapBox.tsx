import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonPopover } from '@ionic/react';
import { createMap } from 'maplibre-gl-js-amplify';
import 'maplibre-gl/dist/maplibre-gl.css';
import 'maplibre-gl-js-amplify/dist/public/amplify-map.css';

import { Venue } from 'models/venue';
import { createMapMarker } from '../utils';

// ESN AISBL office
const DEFAULT_MAP_CENTER: [number, number] = [4.378551, 50.844578];

const MapBox = forwardRef(({ id, venues }: { id: string; venues: Venue[] }, ref) => {
  const [showPopover, setShowPopover] = useState(false);

  const [selectedVenue, setSelectedVenue] = useState<Venue | null>();
  const [map, setMap] = useState<any>();

  useEffect(() => {
    const initializeMap = async (): Promise<void> => {
      const mapOptions = { container: id, zoom: 11, center: DEFAULT_MAP_CENTER };
      if (venues.length) mapOptions.center = venues[0].coordinates;

      const map = await createMap(mapOptions);

      map.on('load', () => {
        const style = getComputedStyle(document.documentElement);
        const primaryColor = style.getPropertyValue('--ion-color-primary');
        const secondaryColor = style.getPropertyValue('--ion-color-secondary');

        const inactiveMarker = createMapMarker(primaryColor);
        const activeMarker = createMapMarker(secondaryColor);
        map.addImage('inactive-marker', inactiveMarker, { pixelRatio: 2 });
        map.addImage('active-marker', activeMarker, { pixelRatio: 2 });

        map.addSource('venues', { type: 'geojson', data: mapVenuesToMaplibreFeatureCollection(venues) });
        map.addLayer({ id: 'venues', type: 'symbol', source: 'venues', layout: { 'icon-image': 'inactive-marker' } });

        map.on('mouseenter', 'venues', () => (map.getCanvas().style.cursor = 'pointer'));
        map.on('mouseleave', 'venues', () => (map.getCanvas().style.cursor = ''));

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
          map.setLayoutProperty('venues', 'icon-image', 'inactive-marker');
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
        <IonCard color="white" style={{ boxShadow: 'none' }}>
          <IonCardHeader>
            <IonCardTitle class="ion-text-center">{selectedVenue?.name}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p className="ion-text-center ion-padding">{selectedVenue?.description}</p>
            <IonButton fill="clear" expand="block" href={`/venue/${selectedVenue?.venueId}`}>
              See details
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
  geometry: { type: 'Point', coordinates: venue.coordinates },
  properties: { id: venue.venueId, name: venue.name, description: venue.description }
});
const mapVenuesToMaplibreFeatureCollection = (venues: Venue[]): any => {
  return {
    type: 'FeatureCollection',
    features: venues.map(v => mapVenueToMaplibreFeature(v))
  };
};
