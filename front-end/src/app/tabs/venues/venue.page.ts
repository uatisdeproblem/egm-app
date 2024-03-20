import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';

import { IDEALoadingService, IDEAMessageService } from '@idea-ionic/common';

import { ManageVenueComponent } from './manageVenue.component';

import { AppService } from 'src/app/app.service';
import { VenuesService } from './venues.service';
import { RoomsService } from '../rooms/rooms.service';

import { Room } from '@models/room.model';
import { Venue } from '@models/venue.model';

@Component({
  selector: 'app-venue',
  templateUrl: './venue.page.html',
  styleUrls: ['./venue.page.scss']
})
export class VenuePage implements OnInit {
  venue: Venue;
  rooms: Room[];

  constructor(
    private route: ActivatedRoute,
    private modalCtrl: ModalController,
    private loading: IDEALoadingService,
    private message: IDEAMessageService,
    private _venues: VenuesService,
    private _rooms: RoomsService,
    public app: AppService
  ) {}

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    try {
      await this.loading.show();
      const venueId = this.route.snapshot.paramMap.get('venueId');
      this.venue = await this._venues.getById(venueId);
      this.rooms = await this._rooms.getList({ venue: this.venue.venueId, force: true });
    } catch (err) {
      this.message.error('COMMON.NOT_FOUND');
    } finally {
      await this.loading.hide();
    }
  }

  async filterRooms(search: string = ''): Promise<void> {
    this.rooms = await this._rooms.getList({ search, venue: this.venue.venueId });
  }

  async manageVenue(venue: Venue): Promise<void> {
    if (!this.app.user.permissions.canManageContents) return

    const modal = await this.modalCtrl.create({
      component: ManageVenueComponent,
      componentProps: { venue },
      backdropDismiss: false
    });
    modal.onDidDismiss().then(async (): Promise<void> => {
      this.venue = await this._venues.getById(venue.venueId);
    });
    await modal.present();
  }
}
