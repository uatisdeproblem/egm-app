import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IDEATranslationsService } from '@idea-ionic/common';

@Component({
  selector: 'add-meal-ticket-modal',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ t._('MANAGE.ADD_MEAL_TICKET') }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">
            <ion-icon name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-item>
        <ion-label position="floating">{{ t._('MANAGE.MEAL_TICKET_NAME') }}</ion-label>
        <ion-input type="text" [(ngModel)]="name"></ion-input>
      </ion-item>
      <ion-item lines="none" class="ion-margin-top">
        <ion-checkbox slot="start" [(ngModel)]="needsScan"></ion-checkbox>
        <ion-label>{{ t._('MANAGE.MEAL_NEEDS_SCAN') }}</ion-label>
      </ion-item>

      <div class="ion-margin-top ion-text-end">
        <ion-button (click)="dismiss()">
          {{ t._('COMMON.CANCEL') }}
        </ion-button>
        <ion-button [disabled]="!name || !name.trim()" (click)="confirm()">
          {{ t._('COMMON.CONFIRM') }}
        </ion-button>
      </div>
    </ion-content>
  `,
  styles: [`
    ion-content {
      --padding-top: 16px;
      --padding-bottom: 16px;
      --padding-start: 16px;
      --padding-end: 16px;
    }
  `]
})
export class AddMealTicketComponent {
  name: string = '';
  needsScan: boolean = false;

  constructor(
    private modalCtrl: ModalController,
    public t: IDEATranslationsService
  ) {}

  confirm() {
    if (this.name && this.name.trim()) {
      this.modalCtrl.dismiss({
        name: this.name.trim(),
        needsScan: this.needsScan
      });
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}