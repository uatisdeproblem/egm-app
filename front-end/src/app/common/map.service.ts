import { Observable } from 'rxjs';
import { Injectable, inject } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Map, LngLatLike, LngLatBounds } from 'maplibre-gl';

import { environment as env } from '@env';

const MAP_HTML_ELEMENT_ID = 'map';
const MAP_ENTITIES_LAYER_NAME = 'entities-layer';
const MAP_ENTITIES_SOURCE_NAME = 'entities-source';

const MAP_CENTER_LAT_LON: LngLatLike = [16, 45];
const MAP_DEFAULT_ZOOM = 14;

@Injectable({ providedIn: 'root' })
export class MapService {
  _platform = inject(Platform);

  /**
   * Initialize a map with a list of entities with geo coordinates.
   */
  async initMap(
    options: {
      entities?: EntityWithCoordinates[];
      id?: string;
      center?: LngLatLike;
      zoom?: number;
    } = {}
  ): Promise<Map> {
    return new Promise(resolve => {
      const { region, mapName, apiKey } = env.aws.location;
      const map = new Map({
        style: `https://maps.geo.${region}.amazonaws.com/maps/v0/maps/${mapName}/style-descriptor?key=${apiKey}`,
        container: options.id || MAP_HTML_ELEMENT_ID,
        center: options.center || MAP_CENTER_LAT_LON,
        zoom: options.zoom || MAP_DEFAULT_ZOOM,
        attributionControl: false
      });

      map.on('load', (): void => {
        const style = getComputedStyle(document.documentElement);
        const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const primaryColor = style.getPropertyValue(isDarkMode ? '--ion-color-tertiary' : '--ion-color-primary');
        const secondaryColor = style.getPropertyValue('--ion-color-secondary');
        const homeColor = style.getPropertyValue('--ion-color-ESNpink');

        const inactiveMarker = this.createMapMarker(primaryColor);
        const activeMarker = this.createMapMarker(secondaryColor);
        map.addImage('inactive-marker', inactiveMarker, { pixelRatio: 2 });
        map.addImage('active-marker', activeMarker, { pixelRatio: 2 });

        const featuresCollection: any = {
          type: 'FeatureCollection',
          features: (options.entities || []).map(e => this.mapEntityWithCoordinatesToMapboxFeature(e))
        };
        map.addSource(MAP_ENTITIES_SOURCE_NAME, { type: 'geojson', data: featuresCollection });
        map.addLayer({
          id: MAP_ENTITIES_LAYER_NAME,
          type: 'symbol',
          source: MAP_ENTITIES_SOURCE_NAME,
          layout: { 'icon-image': 'inactive-marker' }
        });

        const bounds = new LngLatBounds();
        featuresCollection.features.forEach(
          (feature: any): LngLatBounds => bounds.extend(feature.geometry.coordinates)
        );
        map.fitBounds(bounds, { padding: 120 });

        map.on('mouseenter', MAP_ENTITIES_LAYER_NAME, (): string => (map.getCanvas().style.cursor = 'pointer'));
        map.on('mouseleave', MAP_ENTITIES_LAYER_NAME, (): string => (map.getCanvas().style.cursor = ''));

        const homeMarker = this.createMapMarker(homeColor, true);
        map.addImage('home-marker', homeMarker, { pixelRatio: 2 });
        const setHomeMarker = ['match', ['get', 'id'], 'home', 'home-marker', 'inactive-marker'];
        map.setLayoutProperty(MAP_ENTITIES_LAYER_NAME, 'icon-image', setHomeMarker);
      });

      resolve(map);
    });
  }

  /**
   * Trigger when an entity is selected in the map.
   */
  onSelectEntity(map: Map): Observable<any> {
    return new Observable(observer => {
      map.on('click', ({ point }): void => {
        const features = map.queryRenderedFeatures(point, { layers: [MAP_ENTITIES_LAYER_NAME] });
        if (features.length) observer.next(features[0]);
      });
    });
  }

  /**
   * Replace the entities in the map.
   */
  setEntitiesInMap(map: Map, entities: EntityWithCoordinates[]): void {
    const source: any = map.getSource(MAP_ENTITIES_SOURCE_NAME);
    if (!source) return;

    const features = entities.map(x => this.mapEntityWithCoordinatesToMapboxFeature(x));
    const data = { type: 'FeatureCollection', features };
    source.setData(data);
  }

  /**
   * Open a location in the external map application of the device.
   */
  openGeoLocationInMap(coordinates: [number, number]): void {
    const [latitude, longitude] = coordinates;
    if (this._platform.is('ios')) window.open(`maps://maps.google.com/maps?daddr=${latitude},${longitude}&amp;ll=`);
    else window.open(`https://maps.google.com/maps?daddr=${latitude},${longitude}&amp;ll=`);
  }

  private mapEntityWithCoordinatesToMapboxFeature = (entity: EntityWithCoordinates): any => {
    const { coordinates } = entity;
    return { type: 'Feature', properties: entity, geometry: { coordinates, type: 'Point' } };
  };

  private createMapMarker(color: string, isHome?: boolean): any {
    const fillColor = color;
    const strokeColor = 'white';
    const lineWidth = 4;

    return {
      width: 64,
      height: 64,
      data: new Uint8Array(64 * 64 * 4),

      onAdd: function (): void {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        this.context = canvas.getContext('2d');
      },

      render: function (): boolean {
        const context = this.context;
        const markerShape = new Path2D(isHome ? HOME_MARKER : LOCATION_MARKER);
        context.stroke(markerShape);
        context.fillStyle = fillColor;
        context.strokeStyle = strokeColor;
        context.lineWidth = lineWidth;
        context.fill(markerShape);

        this.data = context.getImageData(0, 0, this.width, this.height).data;

        return true;
      }
    };
  }
}

/**
 * An entity with coordinates that can be displayed in a map.
 */
export interface EntityWithCoordinates {
  coordinates: [number, number];
  [prop: string]: any;
}

const LOCATION_MARKER =
  'M24.8133 38.533C18.76 31.493 13 28.8264 13 20.8264C13.4827 14.9864 16.552 9.67169 21.368 6.33302C33.768 -2.26165 50.824 5.78902 52.0667 20.8264C52.0667 28.613 46.5733 31.6797 40.6533 38.373C32.4933 47.5464 35.4 63.093 32.4933 63.093C29.72 63.093 32.4933 47.5464 24.8133 38.533ZM32.4933 8.23969C26.5573 8.23969 21.7467 13.0504 21.7467 18.9864C21.7467 24.9224 26.5573 29.733 32.4933 29.733C38.4293 29.733 43.24 24.9224 43.24 18.9864C43.24 13.0504 38.4293 8.23969 32.4933 8.23969Z';

const HOME_MARKER =
  'M24.8133 38.533C18.76 31.493 13 28.8264 13 20.8264C13.4827 14.9864 16.552 9.67169 21.368 6.33302C33.768 -2.26165 50.824 5.78902 52.0667 20.8264C52.0667 28.613 46.5733 31.6797 40.6533 38.373C32.4933 47.5464 35.4 63.093 32.4933 63.093C29.72 63.093 32.4933 47.5464';
