import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonicModule, ModalController } from '@ionic/angular';
import {
  IDEALoadingService,
  IDEAMessageService,
  IDEATranslationsModule,
  IDEATranslationsService
} from '@idea-ionic/common';

import { HTMLEditorComponent } from 'src/app/common/htmlEditor.component';

import { AppService } from '@app/app.service';
import { MediaService } from 'src/app/common/media.service';
import { MealsService } from './meals.service';

import { Meal, MealTypes } from '@models/meal.model';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, IDEATranslationsModule, HTMLEditorComponent],
  selector: 'app-manage-meal',
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar color="medium">
        <ion-buttons slot="start">
          <ion-button [title]="'COMMON.CANCEL' | translate" (click)="close()">
            <ion-icon slot="icon-only" icon="close-circle"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>{{ 'MEALS.MANAGE_MEAL' | translate }}</ion-title>
        <ion-buttons slot="end">
          <ion-button [title]="'COMMON.SAVE' | translate" (click)="save()">
            <ion-icon slot="icon-only" icon="checkmark-circle"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content [class.ion-padding]="!app.isInMobileMode()">
      <ion-list class="aList" lines="full">
        <ion-item [class.fieldHasError]="hasFieldAnError('name')">
          <ion-label position="stacked">
            {{ 'MEALS.NAME' | translate }} <ion-text class="obligatoryDot"></ion-text>
          </ion-label>
          <ion-input [(ngModel)]="meal.name"></ion-input>
        </ion-item>
        <!-- @todo test date inputs -->
        <!-- @todo date isn't holding up on edit... -->
        <ion-item [class.fieldHasError]="hasFieldAnError('validFrom')">
          <ion-label position="stacked">{{ 'MEALS.VALID_FROM' | translate }}</ion-label>
          <ion-input type="datetime-local" [(ngModel)]="meal.validFrom"></ion-input>
        </ion-item>
        <ion-item [class.fieldHasError]="hasFieldAnError('validTo')">
          <ion-label position="stacked">{{ 'MEALS.VALID_TO' | translate }}</ion-label>
          <ion-input type="datetime-local" [(ngModel)]="meal.validTo"></ion-input>
        </ion-item>
        <ion-item>
          <ion-checkbox slot="start" [(ngModel)]="meal.needsScan" />
          <ion-label>
            {{ 'MEALS.NEEDS_SCAN' | translate }}
          </ion-label>
        </ion-item>
        <ion-item class="ion-text-wrap">
          <!-- @todo fix button width? -->
          <ion-label class="ion-text-wrap">
            <ion-button
              *ngFor="let mealType of MealTypes | keyvalue"
              class="ion-text-wrap"
              [color]="hasFieldAnError('dishDescription.' + mealType.value) ? 'danger' : 'primary'"
              [fill]="currentMealType === mealType.value ? 'solid' : 'outline'"
              (click)="updateSelectedMealType(mealType.value)"
            >
              {{ 'MEALS.TYPES.' + mealType.value | translate }}
              <ion-icon
                *ngIf="hasFieldAnError('dishDescription.' + mealType.value)"
                size="small"
                color="danger"
                slot="end"
                name="warning"
              />
            </ion-button>
          </ion-label>
        </ion-item>
        <ion-list-header [class.fieldHasError]="hasFieldAnError('description')">
          <ion-label>
            <h2>{{ 'MEALS.DESCRIPTION' | translate }}</h2>
          </ion-label>
        </ion-list-header>
        <app-html-editor [(content)]="meal.dishDescription[currentMealType]" [editMode]="true"></app-html-editor>
        <ion-row class="ion-padding-top" *ngIf="meal.mealId">
          <ion-col class="ion-text-right">
            <ion-button color="danger" (click)="askAndDelete()">{{ 'COMMON.DELETE' | translate }}</ion-button>
          </ion-col>
        </ion-row>
      </ion-list>
    </ion-content>
  `
})
export class ManageMealComponent implements OnInit {
  /**
   * The meal to manage.
   */
  @Input() meal: Meal;

  @ViewChild(HTMLEditorComponent) editor: HTMLEditorComponent;

  currentMealType = MealTypes.REGULAR;
  MealTypes = MealTypes;

  entityBeforeChange: Meal;

  errors = new Set<string>();

  constructor(
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private t: IDEATranslationsService,
    private loading: IDEALoadingService,
    private message: IDEAMessageService,
    private _meals: MealsService,
    public app: AppService
  ) {}

  async ngOnInit() {
    this.entityBeforeChange = new Meal(this.meal);
  }

  hasFieldAnError(field: string): boolean {
    return this.errors.has(field);
  }

  updateSelectedMealType(mealType: MealTypes) {
    this.currentMealType = mealType;
    this.editor.content = this.meal.dishDescription[this.currentMealType];
    this.editor.forceTextChange();
  }

  async save(): Promise<void> {
    this.errors = new Set(this.meal.validate());
    if (this.errors.size) return this.message.error('COMMON.FORM_HAS_ERROR_TO_CHECK');

    try {
      await this.loading.show();
      let result: Meal;
      if (!this.meal.mealId) result = await this._meals.insert(this.meal);
      else result = await this._meals.update(this.meal);
      this.meal.load(result);
      this.message.success('COMMON.OPERATION_COMPLETED');
      this.close();
    } catch (err) {
      this.message.error('COMMON.OPERATION_FAILED');
    } finally {
      this.loading.hide();
    }
  }
  close(): void {
    this.meal = this.entityBeforeChange;
    this.modalCtrl.dismiss();
  }

  async askAndDelete(): Promise<void> {
    const doDelete = async (): Promise<void> => {
      try {
        await this.loading.show();
        await this._meals.delete(this.meal);
        this.message.success('COMMON.OPERATION_COMPLETED');
        this.close();
        // this.app.goToInTabs(['venues']); // @todo check where we will go after delete.
      } catch (error) {
        this.message.error('COMMON.OPERATION_FAILED');
      } finally {
        this.loading.hide();
      }
    };
    const header = this.t._('COMMON.ARE_YOU_SURE');
    const message = this.t._('COMMON.ACTION_IS_IRREVERSIBLE');
    const buttons = [
      { text: this.t._('COMMON.CANCEL'), role: 'cancel' },
      { text: this.t._('COMMON.DELETE'), role: 'destructive', handler: doDelete }
    ];
    const alert = await this.alertCtrl.create({ header, message, buttons });
    alert.present();
  }
}
