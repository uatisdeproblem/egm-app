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

import { HTMLEditorComponent } from 'src/app/common/htmlEditor.component';

import { AppService } from '@app/app.service';
import { CommunicationsService } from './communications.service';

import { Communication } from '@models/communication.model';
import { MediaService } from 'src/app/common/media.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, IDEATranslationsModule, HTMLEditorComponent],
  selector: 'app-manage-communication',
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar color="medium">
        <ion-buttons slot="start">
          <ion-button [title]="'COMMON.CANCEL' | translate" (click)="close()">
            <ion-icon slot="icon-only" icon="close-circle"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>{{ 'COMMUNICATIONS.MANAGE_COMMUNICATION' | translate }}</ion-title>
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
            {{ 'COMMUNICATIONS.NAME' | translate }} <ion-text class="obligatoryDot"></ion-text>
          </ion-label>
          <ion-input [(ngModel)]="communication.title"></ion-input>
        </ion-item>
        <ion-item [class.fieldHasError]="hasFieldAnError('imageURL')">
          <ion-label position="stacked">{{ 'COMMUNICATIONS.IMAGE_URL' | translate }}</ion-label>
          <ion-input [(ngModel)]="communication.imageURI"></ion-input>
          <input type="file" accept="image/*" style="display: none" id="upload-image" (change)="uploadImage($event)" />
          <ion-button
            slot="end"
            fill="clear"
            color="medium"
            class="ion-margin-top"
            (click)="browseImagesForElementId('upload-image')"
          >
            <ion-icon icon="cloud-upload-outline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-item>
        <ion-list-header [class.fieldHasError]="hasFieldAnError('content')">
          <ion-label>
            <h2>{{ 'COMMUNICATIONS.CONTENT' | translate }} <ion-text class="obligatoryDot"></ion-text></h2>
          </ion-label>
        </ion-list-header>
        <app-html-editor [(content)]="communication.content" [editMode]="true"></app-html-editor>
        <ion-row class="ion-padding-top" *ngIf="communication.communicationId">
          <ion-col>
            <ion-button color="medium" (click)="duplicateCommunication()">
              {{ 'COMMON.DUPLICATE' | translate }}
            </ion-button>
          </ion-col>
          <ion-col class="ion-text-right">
            <ion-button color="danger" (click)="askAndDelete()">{{ 'COMMON.DELETE' | translate }}</ion-button>
          </ion-col>
        </ion-row>
      </ion-list>
    </ion-content>
  `
})
export class ManageCommunicationComponent {
  /**
   * The communication to manage.
   */
  @Input() communication: Communication;

  errors = new Set<string>();

  constructor(
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private t: IDEATranslationsService,
    private loading: IDEALoadingService,
    private message: IDEAMessageService,
    private _media: MediaService,
    private _communications: CommunicationsService,
    public app: AppService
  ) {}

  hasFieldAnError(field: string): boolean {
    return this.errors.has(field);
  }

  browseImagesForElementId(elementId: string): void {
    document.getElementById(elementId).click();
  }
  async uploadImage({ target }): Promise<void> {
    const file = target.files[0];
    if (!file) return;

    try {
      await this.loading.show();
      const imageURI = await this._media.uploadImage(file);
      await this.app.sleepForNumSeconds(3);
      this.communication.imageURI = imageURI;
    } catch (error) {
      this.message.error('COMMON.OPERATION_FAILED');
    } finally {
      if (target) target.value = '';
      this.loading.hide();
    }
  }

  async save(): Promise<void> {
    this.errors = new Set(this.communication.validate());
    if (this.errors.size) return this.message.error('COMMON.FORM_HAS_ERROR_TO_CHECK');

    try {
      await this.loading.show();
      let result: Communication;
      if (!this.communication.communicationId) result = await this._communications.insert(this.communication);
      else result = await this._communications.update(this.communication);
      this.communication.load(result);
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

  async duplicateCommunication(): Promise<void> {
    const doDuplicate = async (): Promise<void> => {
      try {
        await this.loading.show();
        const copy = new Communication(this.communication);
        copy.title = `${copy.title} - ${this.t._('COMMON.COPY')}`; // @tood translate
        copy.publishedAt = new Date().toISOString();
        copy.load(await this._communications.insert(copy));
        this.message.success('COMMON.OPERATION_COMPLETED');
        this.close();
      } catch (error) {
        this.message.error('COMMON.OPERATION_FAILED');
      } finally {
        this.loading.hide();
      }
    };
    const header = this.t._('COMMON.ARE_YOU_SURE');
    const buttons = [
      { text: this.t._('COMMON.CANCEL'), role: 'cancel' },
      { text: this.t._('COMMON.DUPLICATE'), handler: doDuplicate }
    ];
    const alert = await this.alertCtrl.create({ header, buttons });
    alert.present();
  }
  async askAndDelete(): Promise<void> {
    const doDelete = async (): Promise<void> => {
      try {
        await this.loading.show();
        await this._communications.delete(this.communication);
        this.message.success('COMMON.OPERATION_COMPLETED');
        this.close();
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
