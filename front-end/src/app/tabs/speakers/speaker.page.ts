import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
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

import { ManageSpeakerComponent } from './manageSpeaker.component';
import { SpeakerCardStandaloneComponent } from './speakerCard.component';

import { AppService } from 'src/app/app.service';
import { SpeakersService } from './speakers.service';
import { SessionsService } from '../sessions/sessions.service';
import { SessionCardStandaloneComponent } from '../sessions/sessionCard.component';

import { Speaker } from '@models/speaker.model';
import { Session } from '@models/session.model';

@Component({
  selector: 'app-speaker',
  imports: [
    // Angular
    CommonModule,
    FormsModule,
    // IDEA
    IDEATranslatePipe,
    // App
    SpeakerCardStandaloneComponent,
    SessionCardStandaloneComponent,
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
  templateUrl: './speaker.page.html',
  styleUrls: ['./speaker.page.scss']
})
export class SpeakerPage implements OnInit {
  speaker: Speaker;
  sessions: Session[];

  private route = inject(ActivatedRoute);
  private modalCtrl = inject(ModalController);
  private loading = inject(IDEALoadingService);
  private message = inject(IDEAMessageService);
  private _speakers = inject(SpeakersService);
  private _sessions = inject(SessionsService);
  public app = inject(AppService);

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    try {
      await this.loading.show();
      const speakerId = this.route.snapshot.paramMap.get('speakerId');
      this.speaker = await this._speakers.getById(speakerId);
      this.sessions = await this._sessions.getSpeakerSessions(this.speaker.speakerId)
    } catch (err) {
      this.message.error('COMMON.NOT_FOUND');
    } finally {
      await this.loading.hide();
    }
  }

  async filterSessions(search: string = ''): Promise<void> {
    this.sessions = await this._sessions.getSpeakerSessions(this.speaker.speakerId, search);
  }

  async manageSpeaker(speaker: Speaker): Promise<void> {
    if (!this.app.user.permissions.canManageContents) return

    const modal = await this.modalCtrl.create({
      component: ManageSpeakerComponent,
      componentProps: { speaker },
      backdropDismiss: false
    });
    modal.onDidDismiss().then(async (): Promise<void> => {
      this.speaker = await this._speakers.getById(speaker.speakerId);
    });
    await modal.present();
  }
}
