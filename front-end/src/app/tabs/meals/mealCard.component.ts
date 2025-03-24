import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';

import { IDEATranslationsModule } from '@idea-ionic/common';

import { HTMLEditorComponent } from 'src/app/common/htmlEditor.component';

import { AppService } from 'src/app/app.service';

import { Meal } from '@models/meal.model';
import { MealsService } from './meals.service';
import { ManageMealComponent } from './manageMeal.component';
import { MealQrCodeComponent } from './verifyMeal/mealQrCode.component';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, IDEATranslationsModule, HTMLEditorComponent],
  selector: 'app-meal-card',
  template: `
    <!-- @todo should validity be without timezone?? -->
    <ion-card *ngIf="meal" color="white">
      <ion-card-header>
        <ion-card-title>
          {{ meal.name }}
        </ion-card-title>
        @if(app.user.isMealTicketApproved(meal.mealId)) {
        <ion-card-subtitle>
          {{ 'MEALS.VALIDATED_BY' | translate }}
          <ion-text color="primary">{{ app.user.mealTickets?.[meal.mealId]?.approvedBy }}</ion-text>
          {{ 'COMMON.ON' | translate | lowercase }}
          <ion-text color="primary">
            {{ app.user.mealTickets?.[meal.mealId]?.approvedAt | dateLocale : 'short' }}
          </ion-text>
        </ion-card-subtitle>
        } @else {
        <ion-card-subtitle>
          {{ 'MEALS.VALID_FROM' | translate }}
          <ion-text color="primary">{{ meal.validFrom | dateLocale : 'short' }}</ion-text>
          {{ 'COMMON.TO' | translate | lowercase }}
          <ion-text color="primary">{{ meal.validTo | dateLocale : 'short' }} </ion-text>
        </ion-card-subtitle>
        }
      </ion-card-header>
      <ion-card-content>
        <app-html-editor [content]="meal.dishDescription[app.user.mealType]" [editMode]="false"></app-html-editor>
      </ion-card-content>

      <ion-item lines="none" [color]="_meals.getColourByMealType(app.user.mealType)">
        <ion-label>
          {{ 'MEALS.TYPES.' + app.user.mealType | translate }}
        </ion-label>
      </ion-item>
      @if(meal.needsScan || app.user.permissions.isStaff) {
      <ion-item>
        @if(meal.needsScan) {
        <ion-button
          slot="end"
          fill="clear"
          [disabled]="app.user.isMealTicketApproved(meal.mealId)"
          (click)="generateQrCode()"
        >
          <ion-icon slot="icon-only" name="qr-code" />
        </ion-button>

        } @if(app.user.permissions.canManageContents) {
        <ion-button slot="end" fill="clear" (click)="manageMeal()">
          <ion-icon slot="icon-only" name="hammer" />
        </ion-button>
        }
      </ion-item>
      }
    </ion-card>

    <ion-card *ngIf="!meal" color="white">
      <ion-skeleton-text animated style="height: 200px;"></ion-skeleton-text>
      <ion-card-header>
        <ion-card-title>
          <ion-skeleton-text animated style="width: 60%;"></ion-skeleton-text>
        </ion-card-title>
        <ion-card-subtitle>
          <ion-skeleton-text animated style="width: 50%;"></ion-skeleton-text>
        </ion-card-subtitle>
      </ion-card-header>
      <ion-card-content>
        <ion-skeleton-text animated style="width: 80%;"></ion-skeleton-text>
        <ion-skeleton-text animated style="width: 70%;"></ion-skeleton-text>
        <ion-skeleton-text animated style="width: 60%;"></ion-skeleton-text>
      </ion-card-content>
    </ion-card>
  `
})
export class MealCardStandaloneComponent {
  _modalCtrl = inject(ModalController);
  _meals = inject(MealsService);

  @Input() meal: Meal;

  constructor(public app: AppService) {}

  async generateQrCode(): Promise<void> {
    if (!this.meal.needsScan) return;
    if (this.app.user.isMealTicketApproved(this.meal.mealId)) return;

    const modal = await this._modalCtrl.create({
      component: MealQrCodeComponent,
      componentProps: { meal: this.meal, userId: this.app.user.userId },
      backdropDismiss: false
    });
    await modal.present();
  }

  async manageMeal(): Promise<void> {
    if (!this.app.user.permissions.canManageContents) return;

    const modal = await this._modalCtrl.create({
      component: ManageMealComponent,
      componentProps: { meal: this.meal },
      backdropDismiss: false
    });
    modal.onDidDismiss().then(async (): Promise<void> => {
      this.meal = await this._meals.getById(this.meal.mealId);
    });
    await modal.present();
  }
}
