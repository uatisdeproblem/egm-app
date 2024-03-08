import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { Map } from 'maplibre-gl';
import { IDEALoadingService, IDEAMessageService } from '@idea-ionic/common';

import { AppService } from '@app/app.service';
import { MapService } from '@common/map.service';
import { VenuesService } from './venues.service';

import { Venue } from '@models/venue.model';

@Component({
  selector: 'app-venues',
  templateUrl: 'venues.page.html',
  styleUrls: ['venues.page.scss']
})
export class VenuesPage implements OnInit, OnDestroy {
  venues: Venue[];
  filteredVenues: Venue[];

  segment: 'map' | 'list' = 'map';

  map: Map;
  mapContainerId = 'map-venues';
  selectInMapSubscription: Subscription;

  private _map = inject(MapService);
  private _loading = inject(IDEALoadingService);
  private _message = inject(IDEAMessageService);
  private _venues = inject(VenuesService);
  _app = inject(AppService);

  async ngOnInit(): Promise<void> {
    try {
      await this._loading.show();
      this.venues = await this._venues.getList();

      const entities = this.venues.map(venue => ({ ...venue, coordinates: Venue.getCoordinates(venue) }));
      this.map = await this._map.initMap({ id: this.mapContainerId, entities });

      this.selectInMapSubscription = this._map
        .onSelectEntity(this.map)
        .subscribe(feature => this.selectVenue(feature.properties));
    } catch (error) {
      this._message.error('COMMON.OPERATION_FAILED');
    } finally {
      this._loading.hide();
    }
  }
  ngOnDestroy(): void {
    if (this.selectInMapSubscription) {
      this.selectInMapSubscription.unsubscribe();
      this.selectInMapSubscription = null;
    }
  }

  async filter(search = ''): Promise<void> {
    this.venues = await this._venues.getList({ search });
  }

  selectVenue(venue: Venue): void {
    if (venue.venueId === 'home') return;
    this._app.goToInTabs(['venues', venue.venueId]);
  }
}
