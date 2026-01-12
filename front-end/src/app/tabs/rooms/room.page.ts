import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
import { IDEALoadingService, IDEAMessageService, IDEATranslatePipe } from '@idea-ionic/common';

import { ManageRoomComponent } from './manageRooms.component';
import { RoomCardStandaloneComponent } from './roomCard.component';
import { SessionCardStandaloneComponent } from '../sessions/sessionCard.component';

import { AppService } from 'src/app/app.service';
import { RoomsService } from './rooms.service';
import { SessionsService } from '../sessions/sessions.service';

import { Room } from '@models/room.model';
import { Session } from '@models/session.model';

@Component({
  selector: 'app-room',
  templateUrl: './room.page.html',
  styleUrls: ['./room.page.scss'],
  imports: [
    CommonModule,
    IDEATranslatePipe,
    RoomCardStandaloneComponent,
    SessionCardStandaloneComponent,
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
  ]
})
export class RoomPage implements OnInit {
  room: Room;
  sessions: Session[];

  private route = inject(ActivatedRoute);
  private modalCtrl = inject(ModalController);
  private loading = inject(IDEALoadingService);
  private message = inject(IDEAMessageService);
  private _sessions = inject(SessionsService);
  private _rooms = inject(RoomsService);
  public app = inject(AppService);

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    try {
      await this.loading.show();
      const roomId = this.route.snapshot.paramMap.get('roomId');
      this.room = await this._rooms.getById(roomId);
      this.sessions = await this._sessions.getSessionsInARoom(this.room.roomId);
    } catch (err) {
      this.message.error('COMMON.NOT_FOUND');
    } finally {
      await this.loading.hide();
    }
  }

  async filterSessions(search: string = ''): Promise<void> {
    this.sessions = await this._sessions.getSessionsInARoom(search, this.room.roomId)
  }

  async manageRoom(room: Room): Promise<void> {
    if (!this.app.user.permissions.canManageContents) return

    const modal = await this.modalCtrl.create({
      component: ManageRoomComponent,
      componentProps: { room },
      backdropDismiss: false
    });
    modal.onDidDismiss().then(async (): Promise<void> => {
      this.room = await this._rooms.getById(room.roomId);
    });
    await modal.present();
  }
}
