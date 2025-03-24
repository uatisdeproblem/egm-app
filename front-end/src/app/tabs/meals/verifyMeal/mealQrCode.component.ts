import { Component, Input, OnInit, inject } from '@angular/core';
import QRCode from 'qrcode';
import { IDEALoadingService, IDEAMessageService, IDEATranslationsModule } from '@idea-ionic/common';

import { AppService } from '@app/app.service';
import { MealsService } from '../meals.service';

import { Meal } from '@models/meal.model';
import { ActivatedRoute } from '@angular/router';
import { IonicModule, ModalController } from '@ionic/angular';

import { environment as env } from '@env';

@Component({
  standalone: true,
  imports: [IonicModule, IDEATranslationsModule],
  selector: 'app-meal-qr-code',
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar color="white">
        <ion-buttons slot="start">
          <ion-button (click)="close()"><ion-icon icon="close" slot="icon-only" /></ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="maxWidthContainer">
        <ion-card color="white">
          @if (meal) {
          <ion-card-header class="ion-text-center">
            <ion-card-title>{{ meal.name }}</ion-card-title>
          </ion-card-header>
          }
          <ion-card-content>
            <div id="qrCodeContainer"></div>
          </ion-card-content>

          <ion-item lines="none" [color]="_meals.getColourByMealType(_app.user.mealType)">
            <ion-label>
              {{ 'MEALS.TYPES.' + _app.user.mealType | translate }}
            </ion-label>
          </ion-item>
        </ion-card>
      </div>
    </ion-content>
  `,
  styles: [
    `
      div.maxWidthContainer {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        ion-card {
          width: 300px;
          margin: auto;
          padding: auto;
        }
      }
    `
  ]
})
export class MealQrCodeComponent {
  private modalCtrl = inject(ModalController);
  _meals = inject(MealsService);
  _app = inject(AppService);

  @Input() meal: Meal;

  async ionViewWillEnter(): Promise<void> {
    this.generateQRCode();
  }

  private generateQRCode(): void {
    const baseURL = env.idea.api.stage === 'dev' ? 'https://dev.egm-app.click' : env.idea.app.url;
    const url = `${baseURL}/t/meals/verify/${this.meal.mealId}/${this._app.user.userId}`;

    const container = document.getElementById('qrCodeContainer');
    container.innerHTML = '';

    QRCode.toCanvas(url, { errorCorrectionLevel: 'L' }, (err: Error, canvas: HTMLCanvasElement): void => {
      if (err) throw err;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      container.appendChild(canvas);
    });
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
