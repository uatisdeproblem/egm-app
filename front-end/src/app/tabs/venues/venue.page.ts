import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IDEALoadingService, IDEAMessageService, IDEATranslatePipe } from '@idea-ionic/common';
import {
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonRow,
  IonSearchbar,
  IonTitle,
  IonToolbar,
  ModalController
} from '@ionic/angular/standalone';

import { ManageVenueComponent } from './manageVenue.component';
import { VenueCardStandaloneComponent } from './venueCard.component';

import { AppService } from 'src/app/app.service';
import { VenuesService } from './venues.service';
import { RoomsService } from '../rooms/rooms.service';
import { RoomCardStandaloneComponent } from '../rooms/roomCard.component';

import { Room } from '@models/room.model';
import { Venue } from '@models/venue.model';

@Component({
  selector: 'app-venue',
  imports: [
    // Angular
    CommonModule,
    // IDEA
    IDEATranslatePipe,
    // App
    VenueCardStandaloneComponent,
    RoomCardStandaloneComponent,
    // Ionic
    IonButton,
    IonButtons,
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonRow,
    IonSearchbar,
    IonTitle,
    IonToolbar
  ],
  templateUrl: './venue.page.html',
  styleUrls: ['./venue.page.scss']
})
export class VenuePage implements OnInit {
  venue: Venue;
  rooms: Room[];

  private route = inject(ActivatedRoute);
  private modalCtrl = inject(ModalController);
  private loading = inject(IDEALoadingService);
  private message = inject(IDEAMessageService);
  private _venues = inject(VenuesService);
  private _rooms = inject(RoomsService);
  public app = inject(AppService);

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
    if (!this.app.user.permissions.canManageContents) return;

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
