import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent, IonInfiniteScroll } from '@ionic/angular';

// import { openGeoLocationInMap } from '../utils'; // @todo add map #61 this method is in react branch

import { Venue } from '@models/venue.model';
import { VenuesService } from './venues.service';
import { AppService } from 'src/app/app.service';
import { IDEALoadingService, IDEAMessageService } from '@idea-ionic/common';

@Component({
  selector: 'app-venues',
  templateUrl: './venues.page.html',
  styleUrls: ['./venues.page.scss']
})
export class VenuesPage implements OnInit {
  @ViewChild(IonContent) content: IonContent;

  segment = 'map'; // @todo add map #61
  venues: Venue[];
  filteredVenues: Venue[];
  mapRef: any; // @todo add map #61

  constructor(
    private loading: IDEALoadingService,
    private message: IDEAMessageService,
    private _venues: VenuesService,
    public app: AppService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    try {
      await this.loading.show();
      this.venues = await this._venues.getList({});
    } catch (error) {
      this.message.error('COMMON.OPERATION_FAILED');
    } finally {
      this.loading.hide();
    }
  }

  async filter(search = ''): Promise<void> {
    this.venues = await this._venues.getList({ search });
  }

  selectVenue(venue: Venue) {
    if (venue.venueId === 'home') return;

    this.app.goToInTabs(['venues', venue.venueId]);

    // @todo add map #61
    // if (isMobileMode()) this.app.goToInTabs(['venue', venue.venueId])
    // else {
    //   this.mapRef.selectVenue(venue);
    // }
  }

  // @todo add map #61
  // navigateToVenue(venue: Venue, event: Event) {
  //   event.stopPropagation();
  //   openGeoLocationInMap(venue.latitude, venue.longitude);
  // }
}
