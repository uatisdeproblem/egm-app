import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, Input } from '@angular/core';
import { AlertController, IonicModule, ModalController } from '@ionic/angular';
import {
  IDEALoadingService,
  IDEAMessageService,
  IDEATranslationsModule,
  IDEATranslationsService
} from '@idea-ionic/common';

import { UsefulLinksService } from './usefulLinks.service';

import { UsefulLink } from '@models/usefulLink.model';
import { AuthServices } from '@models/user.model';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, IDEATranslationsModule],
  selector: 'app-manage-useful-link',
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar color="ideaToolbar">
        <ion-buttons slot="start">
          <ion-button [title]="'COMMON.CANCEL' | translate" (click)="close()">
            <ion-icon slot="icon-only" icon="close-circle"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>{{ 'USEFUL_LINKS.MANAGE_LINK' | translate }}</ion-title>
        <ion-buttons slot="end">
          <ion-button [title]="'COMMON.SAVE' | translate" (click)="save()">
            <ion-icon slot="icon-only" icon="checkmark-circle"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list class="aList" lines="full">
        <ion-item [class.fieldHasError]="hasFieldAnError('name')">
          <ion-label position="stacked">
            {{ 'USEFUL_LINKS.NAME' | translate }} <ion-text class="obligatoryDot"></ion-text>
          </ion-label>
          <ion-input [(ngModel)]="link.name"></ion-input>
        </ion-item>
        <ion-item [class.fieldHasError]="hasFieldAnError('url')">
          <ion-label position="stacked">
            {{ 'USEFUL_LINKS.URL' | translate }} <ion-text class="obligatoryDot"></ion-text>
          </ion-label>
          <ion-input [(ngModel)]="link.url"></ion-input>
        </ion-item>
        <ion-item [class.fieldHasError]="hasFieldAnError('audience')">
          <ion-label position="stacked">{{ 'USEFUL_LINKS.AUDIENCE' | translate }}</ion-label>
          <ion-input [(ngModel)]="link.audience"></ion-input>
        </ion-item>
        <ion-item [class.fieldHasError]="hasFieldAnError('visibleTo')">
          <ion-label position="stacked">{{ 'USEFUL_LINKS.VISIBLE_TO' | translate }}</ion-label>
        </ion-item>
        <ion-item *ngFor="let service of AuthServices | keyvalue" lines="none">
          <ion-checkbox
            slot="start"
            [checked]="isVisible(service.value)"
            (ionChange)="updateVisibility(service.value, $event)"
          ></ion-checkbox>
          <ion-label>
            {{ getLabelForService(service.value) }}
          </ion-label>
        </ion-item>
        <ion-row class="ion-padding-top" *ngIf="link.linkId">
          <ion-col class="ion-text-right ion-padding-end">
            <ion-button color="danger" (click)="askAndDelete()">{{ 'COMMON.DELETE' | translate }}</ion-button>
          </ion-col>
        </ion-row>
      </ion-list>
    </ion-content>
  `
})
export class ManageUsefulLinkStandaloneComponent {
  /**
   * The useful link to manage.
   */
  @Input() link: UsefulLink;

  AuthServices = AuthServices;

  errors = new Set<string>();

  constructor(
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private t: IDEATranslationsService,
    private loading: IDEALoadingService,
    private message: IDEAMessageService,
    private _usefulLinks: UsefulLinksService
  ) {}

  hasFieldAnError(field: string): boolean {
    return this.errors.has(field);
  }

  async save(): Promise<void> {
    this.errors = new Set(this.link.validate());
    if (this.errors.size) return this.message.error('COMMON.FORM_HAS_ERROR_TO_CHECK');

    try {
      await this.loading.show();
      let result: UsefulLink;
      if (!this.link.linkId) result = await this._usefulLinks.insert(this.link);
      else result = await this._usefulLinks.update(this.link);
      this.link.load(result);
      this.message.success('COMMON.OPERATION_COMPLETED');
      this.close();
    } catch (err) {
      this.message.error('COMMON.OPERATION_FAILED');
    } finally {
      this.loading.hide();
    }
  }
  close(): void {
    this.modalCtrl.dismiss();
  }

  async askAndDelete(): Promise<void> {
    const doDelete = async (): Promise<void> => {
      try {
        await this.loading.show();
        await this._usefulLinks.delete(this.link);
        this.message.success('COMMON.OPERATION_COMPLETED');
        this.close();
      } catch (error) {
        this.message.error('COMMON.OPERATION_FAILED');
      } finally {
        this.loading.hide();
      }
    };
    const header = this.t._('COMMON.ARE_YOU_SURE');
    const subHeader = this.t._('COMMON.ACTION_IS_IRREVERSIBLE');
    const buttons = [
      { text: this.t._('COMMON.CANCEL'), role: 'cancel' },
      { text: this.t._('COMMON.DELETE'), role: 'destructive', handler: doDelete }
    ];
    const alert = await this.alertCtrl.create({ header, subHeader, buttons });
    alert.present();
  }

  updateVisibility(service: AuthServices, event: CustomEvent): void {
    const isChecked = event.detail.checked;

    if (isChecked && !this.link.visibleTo.includes(service)) {
      this.link.visibleTo.push(service);
    } else if (!isChecked) {
      this.link.visibleTo = this.link.visibleTo.filter(item => item !== service);
    }
  }

  isVisible(service: AuthServices): boolean {
    return this.link.visibleTo.includes(service);
  }

  getLabelForService(service: AuthServices): string {
    if (service === AuthServices.COGNITO) return this.t._('AUTH.EXTERNALS_SIGN_IN');
    else if (service === AuthServices.ESN_ACCOUNTS) return this.t._('AUTH.AN_ESNER');
  }
}

