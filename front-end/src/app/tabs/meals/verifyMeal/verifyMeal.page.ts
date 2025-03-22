import { Component, OnInit, inject } from '@angular/core';
import {
  IDEALoadingService,
  IDEAMessageService,
  IDEATranslationsModule,
  IDEATranslationsService
} from '@idea-ionic/common';

import { AppService } from '@app/app.service';
import { MealsService } from '../meals.service';

import { ApprovedType, Meal } from '@models/meal.model';
import { ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule, IonicModule, IDEATranslationsModule],
  selector: 'app-verify-meal',
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar color="white">
        <ion-buttons slot="start">
          <ion-button (click)="_app.closePage()">
            <ion-icon icon="arrow-back" slot="icon-only" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="maxWidthContainer">
        <ion-card color="white">
          @if (meal) {
          <ion-card-header class="ion-text-center">
            <ion-card-title>{{ meal.name }}</ion-card-title>

            <p>
              {{ 'MEALS.VALID_FROM' | translate }}
              <ion-text color="primary">{{ meal.validFrom | dateLocale : 'short' }}</ion-text>
              {{ 'COMMON.TO' | translate | lowercase }}
              <ion-text color="primary">{{ meal.validTo | dateLocale : 'short' }} </ion-text>
            </p>
          </ion-card-header>
          }
          <ion-card-content>
            @if(success) {
            <ion-item lines="none">
              <ion-label class="ion-text-wrap">{{ 'MEALS.VALIDATED_SUCCESSFULLY' | translate }}</ion-label>
              <ion-icon slot="end" name="checkmark-done" color="success" />
            </ion-item>
            } @if(error) {
            <ion-item lines="none">
              <ion-label class="ion-text-wrap">
                {{ 'COMMON.ERROR' | translate }}
                <p>
                  {{ error | translate }}
                </p>
              </ion-label>
              <ion-icon slot="end" name="close" color="danger" />
            </ion-item>
            }
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  `,
  styles: [
    `
      div.maxWidthContainer {
        max-width: 300px;
      }
    `
  ]
})
export class VerifyMealPage implements OnInit {
  private _loading = inject(IDEALoadingService);
  private _message = inject(IDEAMessageService);
  private _meals = inject(MealsService);
  private route = inject(ActivatedRoute);
  private _t = inject(IDEATranslationsService);
  _app = inject(AppService);

  meal: Meal;

  success = false;
  error: string;

  async ngOnInit(): Promise<void> {
    if (!this._app.user.permissions.isStaff) return this._app.closePage('COMMON.UNAUTHORIZED');

    try {
      await this._loading.show();
      const mealId = this.route.snapshot.paramMap.get('mealId');
      const userId = this.route.snapshot.paramMap.get('userId');

      this.meal = await this._meals.getById(mealId);

      await this._meals.validateTicket(this.meal, userId, ApprovedType.QR_SCAN);
      this.success = true;
    } catch (error) {
      console.log('error', error.message);
      if (error.message === 'Unauthorized') this.error = 'MEALS.VALIDATE_ERRORS.UNAUTHORIZED';
      else if (error.message === 'Ticket not available') this.error = 'MEALS.VALIDATE_ERRORS.TICKET_UNAVAILABLE';
      else if (error.message === 'Ticket already used') this.error = 'MEALS.VALIDATE_ERRORS.TICKET_USED';
      else if (error.message === 'Meal not found') this.error = 'MEALS.VALIDATE_ERRORS.NO_MEAL';
      else if (error.message === 'User not found') this.error = 'MEALS.VALIDATE_ERRORS.NO_USER';
      else this.error = 'COMMON.OPERATION_FAILED';

      this._message.error(this.error);
    } finally {
      this._loading.hide();
    }
  }
}
