import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, Input, OnInit } from '@angular/core';
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
import { SpeakersService } from './speakers.service';
import { OrganizationsService } from '../organizations/organizations.service';

import { OrganizationLinked } from '@models/organization.model';
import { Speaker } from '@models/speaker.model';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, IDEATranslationsModule, HTMLEditorComponent],
  selector: 'app-manage-speaker',
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar color="medium">
        <ion-buttons slot="start">
          <ion-button [title]="'COMMON.CANCEL' | translate" (click)="close()">
            <ion-icon slot="icon-only" icon="close-circle"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>{{ 'SPEAKERS.MANAGE_SPEAKER' | translate }}</ion-title>
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
            {{ 'SPEAKERS.NAME' | translate }} <ion-text class="obligatoryDot"></ion-text>
          </ion-label>
          <ion-input [(ngModel)]="speaker.name"></ion-input>
        </ion-item>
        <ion-item [class.fieldHasError]="hasFieldAnError('imageURL')">
          <ion-label position="stacked">{{ 'SPEAKERS.IMAGE_URL' | translate }}</ion-label>
          <ion-input [(ngModel)]="speaker.imageURI"></ion-input>
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
        <ion-item [class.fieldHasError]="hasFieldAnError('organization')">
          <ion-label position="stacked">
            {{ 'SPEAKERS.ORGANIZATION' | translate }}
            <ion-text class="obligatoryDot"></ion-text>
          </ion-label>
          <ion-select interface="popover" [(ngModel)]="speaker.organization">
            <ion-select-option *ngFor="let organization of organizations" [value]="organization">
              {{ organization.name }}
            </ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item>
          <ion-label position="stacked">
            {{ 'SPEAKERS.TITLE' | translate }}
          </ion-label>
          <ion-input [(ngModel)]="speaker.title"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="stacked">
            {{ 'SPEAKERS.EMAIL' | translate }}
          </ion-label>
          <ion-input [(ngModel)]="speaker.contactEmail"></ion-input>
        </ion-item>
        <ion-list-header>
          <ion-label>
            <h2>{{ 'SPEAKERS.SOCIAL_MEDIA' | translate }}</h2>
          </ion-label>
        </ion-list-header>
        <ion-item>
          <ion-icon name="logo-linkedin" slot="start" />
          <ion-input [(ngModel)]="speaker.socialMedia.linkedIn"></ion-input>
        </ion-item>
        <ion-item>
          <ion-icon name="logo-instagram" slot="start" />
          <ion-input [(ngModel)]="speaker.socialMedia.instagram"></ion-input>
        </ion-item>
        <ion-item>
          <ion-icon name="logo-twitter" slot="start" />
          <ion-input [(ngModel)]="speaker.socialMedia.twitter"></ion-input>
        </ion-item>
        <ion-list-header [class.fieldHasError]="hasFieldAnError('description')">
          <ion-label>
            <h2>{{ 'SPEAKERS.DESCRIPTION' | translate }}</h2>
          </ion-label>
        </ion-list-header>
        <app-html-editor [(content)]="speaker.description" [editMode]="true"></app-html-editor>
        <ion-row class="ion-padding-top" *ngIf="speaker.speakerId">
          <ion-col class="ion-text-right">
            <ion-button color="danger" (click)="askAndDelete()">{{ 'COMMON.DELETE' | translate }}</ion-button>
          </ion-col>
        </ion-row>
      </ion-list>
    </ion-content>
  `
})
export class ManageSpeakerComponent implements OnInit {
  /**
   * The speaker to manage.
   */
  @Input() speaker: Speaker;

  entityBeforeChange: Speaker;
  organizations: OrganizationLinked[] = [];

  errors = new Set<string>();

  constructor(
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private t: IDEATranslationsService,
    private loading: IDEALoadingService,
    private message: IDEAMessageService,
    private _media: MediaService,
    private _organizations: OrganizationsService,
    private _speakers: SpeakersService,
    public app: AppService
  ) {}

  async ngOnInit() {
    this.entityBeforeChange = new Speaker(this.speaker);
    this.organizations = (await this._organizations.getList({ force: true })).map(o => new OrganizationLinked(o));
  }

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
      await sleepForNumSeconds(3);
      this.speaker.imageURI = imageURI;
    } catch (error) {
      this.message.error('COMMON.OPERATION_FAILED');
    } finally {
      if (target) target.value = '';
      this.loading.hide();
    }
  }

  async save(): Promise<void> {
    this.errors = new Set(this.speaker.validate());
    if (this.errors.size) return this.message.error('COMMON.FORM_HAS_ERROR_TO_CHECK');

    try {
      await this.loading.show();
      let result: Speaker;
      if (!this.speaker.speakerId) result = await this._speakers.insert(this.speaker);
      else result = await this._speakers.update(this.speaker);
      this.speaker.load(result);
      this.message.success('COMMON.OPERATION_COMPLETED');
      this.close();
    } catch (err) {
      this.message.error('COMMON.OPERATION_FAILED');
    } finally {
      this.loading.hide();
    }
  }
  close(): void {
    this.speaker = this.entityBeforeChange;
    this.modalCtrl.dismiss();
  }

  async askAndDelete(): Promise<void> {
    const doDelete = async (): Promise<void> => {
      try {
        await this.loading.show();
        await this._speakers.delete(this.speaker);
        this.message.success('COMMON.OPERATION_COMPLETED');
        this.close();
        this.app.goToInTabs(['speakers']);
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

const sleepForNumSeconds = (numSeconds = 1): Promise<void> =>
  new Promise(resolve => setTimeout((): void => resolve(null), 1000 * numSeconds));
