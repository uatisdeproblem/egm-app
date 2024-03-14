import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { IDEAMessageService, IDEATranslationsModule } from '@idea-ionic/common';

import { ManageCommunicationComponent } from './manageCommunication.component';
import { CommunicationDetailComponent } from './communicationDetail.component';

import { AppService } from '@app/app.service';
import { CommunicationsService } from './communications.service';

import { Communication } from '@models/communication.model';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IDEATranslationsModule,
    ManageCommunicationComponent
  ],
  selector: 'app-communications',
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar color="medium">
        <ion-buttons slot="start">
          <ion-button (click)="close()">
            <ion-icon slot="start" icon="close" /> {{ 'COMMON.CLOSE' | translate }}
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list class="aList">
        <ion-list-header>
          <ion-label>
            <h1>{{ 'COMMUNICATIONS.COMMUNICATIONS' | translate }}</h1>
          </ion-label>
        </ion-list-header>
        <ion-item class="noElements" *ngIf="communications && !communications.length">
          <ion-label>{{ 'COMMON.NO_ELEMENTS' | translate }}</ion-label>
        </ion-item>
        <ion-item *ngIf="!communications">
          <ion-label><ion-skeleton-text animated /></ion-label>
        </ion-item>
        <ion-item button *ngFor="let communication of communications" (click)="openCommunication(communication)">
          <ion-label class="ion-text-wrap">
            {{ communication.title }}
          </ion-label>
          <ion-note slot="end">{{ communication.publishedAt | dateLocale : 'longDate' }}</ion-note>
          <ion-button
            slot="end"
            color="ESNgreen"
            fill="clear"
            *ngIf="app.user.permissions.isAdmin"
            (click)="editCommunication(communication, $event)"
          >
            <ion-icon slot="icon-only" icon="pencil" />
          </ion-button>
        </ion-item>
      </ion-list>
    </ion-content>
  `,
  styles: [
    `
      ion-list.aList ion-list-header {
        margin-left: 8px;
      }
      ion-toolbar ion-buttons[slot='start'] ion-button {
        margin-left: 8px;
      }
    `
  ]
})
export class CommunicationsComponent implements OnInit {
  communications: Communication[];

  constructor(
    private modalCtrl: ModalController,
    private message: IDEAMessageService,
    private _communications: CommunicationsService,
    public app: AppService
  ) {}
  async ngOnInit(): Promise<void> {
    await this.loadList();
  }

  async loadList(): Promise<void> {
    try {
      this.communications = null;
      this.communications = await this._communications.getList({ force: true });
    } catch (error) {
      this.message.error('COMMON.COULDNT_LOAD_LIST');
    }
  }

  close(): void {
    this.modalCtrl.dismiss();
  }

  async openCommunication(communication: Communication): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: CommunicationDetailComponent,
      componentProps: { communication }
    });
    modal.present();
  }

  async editCommunication(communication: Communication, event?: Event): Promise<void> {
    if (event) event.stopPropagation();

    const modal = await this.modalCtrl.create({
      component: ManageCommunicationComponent,
      componentProps: { communication },
      backdropDismiss: false
    });
    modal.onDidDismiss().then(async (): Promise<void> => {
      this.communications = await this._communications.getList({ force: true });
    });
    await modal.present();
  }
}
