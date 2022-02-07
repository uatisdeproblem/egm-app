import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonPopover } from '@ionic/react';
import { createMap } from 'maplibre-gl-js-amplify';
import 'maplibre-gl/dist/maplibre-gl.css';
import 'maplibre-gl-js-amplify/dist/public/amplify-map.css';

import { Venue } from '../models';
import { createMapMarker } from '../utils';

const MapBox = forwardRef(({ id, venues }: { id: string; venues: Venue[] }, ref) => {
  const mapDivRef = useRef<HTMLDivElement>(null);

  const [showPopover, setShowPopover] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>();
  const [map, setMap] = useState<any>();

  useEffect(() => {
    const initializeMap = async () => {
      if (mapDivRef.current === null) return;

      const mapOptions: any = { container: mapDivRef.current, zoom: 11 };
      if (venues.length) mapOptions.center = [venues[0].longitude, venues[0].latitude];

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
        map.addLayer({
          id: 'venues',
          type: 'symbol',
          source: 'venues',
          layout: { 'icon-image': 'inactive-marker' }
        });

        map.on('mouseenter', 'venues', () => (map.getCanvas().style.cursor = 'pointer'));
        map.on('mouseleave', 'venues', () => (map.getCanvas().style.cursor = ''));

        map.on('click', 'venues', ({ point }: any) => {
          const markers = map.queryRenderedFeatures(point, { layers: ['venues'] });
          if (!markers.length) return;

          const venue = venues.find(v => v.id === markers[0].properties.id);
          if (venue) map.fire('openVenue', { venue });
        });

        map.on('openVenue', ({ venue }) => {
          if (!venue) return;
          map.setLayoutProperty('venues', 'icon-image', [
            'match',
            ['get', 'id'],
            venue.id,
            'active-marker',
            'inactive-marker'
          ]);
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
  }, []);

  useImperativeHandle(ref, () => ({
    selectVenue(venue: Venue) {
      map.fire('openVenue', { venue });
    }
  }));

  return (
    <>
      <div ref={mapDivRef} id={id} className="fullheight-map" />
      <IonPopover isOpen={showPopover} onDidDismiss={() => map.fire('dismissPopover')}>
        <IonCard color="white" style={{ boxShadow: 'none' }}>
          <IonCardHeader>
            <IonCardTitle class="ion-text-center">{selectedVenue?.name}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p className="ion-text-center ion-padding">{selectedVenue?.description}</p>
            <IonButton fill="clear" expand="block" href={`/venue/${selectedVenue?.id}`}>
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
  geometry: { type: 'Point', coordinates: [venue.longitude, venue.latitude] },
  properties: { id: venue.id, name: venue.name, description: venue.description }
});
const mapVenuesToMaplibreFeatureCollection = (venues: Venue[]): any => {
  return {
    type: 'FeatureCollection',
    features: venues.map(v => mapVenueToMaplibreFeature(v))
  };
};
