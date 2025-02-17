import { Component } from "@angular/core";
import { AppService } from "@app/app.service";
import { ModalController } from "@ionic/angular";

@Component({
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ 'MANAGE.ADD_MEAL_TYPE' | translate }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="modalCtrl.dismiss()">{{ 'COMMON.CANCEL' | translate }}</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list>
        <ion-item>
          <ion-input
            [(ngModel)]="mealType.name"
            placeholder="{{ 'MANAGE.MEAL_TYPE_NAME' | translate }}">
          </ion-input>
        </ion-item>

        <ion-item>
          <ion-select
            [(ngModel)]="mealType.color"
            placeholder="{{ 'MANAGE.MEAL_TYPE_COLOR' | translate }}">
            <ion-select-option *ngFor="let color of ESNcolors" [value]="color.value">
              {{color.name}}
            </ion-select-option>
          </ion-select>
        </ion-item>
      </ion-list>

      <ion-button expand="block" (click)="confirm()">
        {{ 'COMMON.CONFIRM' | translate }}
      </ion-button>
    </ion-content>
  `
})
export class AddMealTypeComponent {
  mealType = { name: '', color: '' };
  ESNcolors: { name: string, value: string}[];

  constructor(
    public modalCtrl: ModalController,
    private app: AppService
  ) {
    this.ESNcolors = this.app.ESNcolors;
  }

  confirm() {
    if (this.mealType.name?.trim()) {
      this.modalCtrl.dismiss(this.mealType);
    }
  }
}