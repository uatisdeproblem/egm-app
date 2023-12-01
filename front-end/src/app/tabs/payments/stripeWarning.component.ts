import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Browser } from '@capacitor/browser';

import { Platform, IonicModule, ModalController } from '@ionic/angular';
import { IDEAMessageService, IDEATranslationsModule, IDEATranslationsService } from '@idea-ionic/common';

import { AppService } from '../../app.service';

/**
 * A warning message before proceeding to Stripe informing the user of the procedure.
 */
@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, IDEATranslationsModule],
  selector: 'fhe-header-bar',
  template: `
    <ion-header>
      <ion-toolbar color="ideaToolbar">
        <ion-buttons slot="start">
          <ion-button [title]="'COMMON.CLOSE' | translate" (click)="close()">
            <ion-icon icon="close-circle-outline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>
          <ion-icon name="warning"></ion-icon>
          {{ 'STRIPE.BEFORE_YOU_PROCEED' | translate }}
        </ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-card color="warning">
        <ion-card-header>
          <ion-title> {{ 'STRIPE.DISCLAIMER' | translate }}: </ion-title>
        </ion-card-header>
        <ion-card-content>
          <ion-item lines="none" color="warning">
            {{ 'STRIPE.DISCLAIMER_I' | translate }}
          </ion-item>
        </ion-card-content>
      </ion-card>
      <ion-card class="ion-margin-bottom">
        <ion-card-content color="dark">
          <ion-item lines="none">
            {{ 'USER.YOUR_REFERENCE' | translate }}: {{ app.user.spot.spotId }}
            <ion-button slot="end" (click)="copyHTMLInputText(app.user.userId)">
              <ion-icon name="copy" slot="icon-only"></ion-icon>
            </ion-button>
          </ion-item>
          <ion-item class="ion-margin-top" lines="none">
            <ion-checkbox justify="space-between" [(ngModel)]="userHasRead">
              {{ 'STRIPE.CONFIRM_READ' | translate }}
            </ion-checkbox>
          </ion-item>
        </ion-card-content>
      </ion-card>
      <ion-row [style.margin-top]="'100px'">
        <ion-col [size]="6">
          <ion-button expand="block" color="danger">
            {{ 'COMMON.CANCEL' | translate }}
          </ion-button>
        </ion-col>
        <ion-col [size]="6">
          <ion-button
            expand="block"
            color="success"
            [fill]="userHasRead ? 'solid' : 'outline'"
            [disabled]="!userHasRead"
            (click)="openLink()"
          >
            {{ 'STRIPE.PROCEED_TO_STRIPE' | translate }}
          </ion-button>
        </ion-col>
      </ion-row>
    </ion-content>
  `
})
export class StripeWarningStandaloneComponent {
  @Input() url: string;

  userHasRead = false;

  constructor(
    private modalCtrl: ModalController,
    private message: IDEAMessageService,
    public platform: Platform,
    public t: IDEATranslationsService,
    public app: AppService
  ) {}

  async openLink(): Promise<void> {
    await Browser.open({ url: this.url });
  }

  copyHTMLInputText(text: string): void {
    if (!text) return;

    navigator.clipboard.writeText(text);

    this.message.info('COMMON.COPIED');
  }

  close(): void {
    this.modalCtrl.dismiss();
  }
}
