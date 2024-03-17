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

import { Organization } from '@models/organization.model';
import { OrganizationsService } from './organizations.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, IDEATranslationsModule, HTMLEditorComponent],
  selector: 'app-manage-organization',
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar color="medium">
        <ion-buttons slot="start">
          <ion-button [title]="'COMMON.CANCEL' | translate" (click)="close()">
            <ion-icon slot="icon-only" icon="close-circle"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>{{ 'ORGANIZATIONS.MANAGE_ORGANIZATION' | translate }}</ion-title>
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
            {{ 'ORGANIZATIONS.NAME' | translate }} <ion-text class="obligatoryDot"></ion-text>
          </ion-label>
          <ion-input [(ngModel)]="organization.name"></ion-input>
        </ion-item>
        <ion-item [class.fieldHasError]="hasFieldAnError('imageURL')">
          <ion-label position="stacked">{{ 'ORGANIZATIONS.IMAGE_URL' | translate }}</ion-label>
          <ion-input [(ngModel)]="organization.imageURI"></ion-input>
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
      <ion-item>
        <ion-label position="stacked">
          {{ 'ORGANIZATIONS.WEBSITE' | translate }}
        </ion-label>
        <ion-input [(ngModel)]="organization.website"></ion-input>
      </ion-item>
      <ion-item>
        <ion-label position="stacked">
          {{ 'ORGANIZATIONS.EMAIL' | translate }}
        </ion-label>
        <ion-input [(ngModel)]="organization.contactEmail"></ion-input>
      </ion-item>
        <ion-list-header [class.fieldHasError]="hasFieldAnError('description')">
          <ion-label>
            <h2>{{ 'ORGANIZATION.DESCRIPTION' | translate }}</h2>
          </ion-label>
        </ion-list-header>
        <app-html-editor [(content)]="organization.description" [editMode]="true"></app-html-editor>
        <ion-row class="ion-padding-top" *ngIf="organization.organizationId">
          <ion-col class="ion-text-right">
            <ion-button color="danger" (click)="askAndDelete()">{{ 'COMMON.DELETE' | translate }}</ion-button>
          </ion-col>
        </ion-row>
      </ion-list>
    </ion-content>
  `
})
export class ManageOrganizationComponent implements OnInit {
  /**
   * The organization to manage.
   */
  @Input() organization: Organization;

  entityBeforeChange: Organization

  errors = new Set<string>();

  constructor(
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private t: IDEATranslationsService,
    private loading: IDEALoadingService,
    private message: IDEAMessageService,
    private _media: MediaService,
    private _organizations: OrganizationsService,
    public app: AppService
  ) {}

  ngOnInit() {
    this.entityBeforeChange = new Organization(this.organization)
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
      this.organization.imageURI = imageURI;
    } catch (error) {
      this.message.error('COMMON.OPERATION_FAILED');
    } finally {
      if (target) target.value = '';
      this.loading.hide();
    }
  }

  async save(): Promise<void> {
    this.errors = new Set(this.organization.validate());
    if (this.errors.size) return this.message.error('COMMON.FORM_HAS_ERROR_TO_CHECK');

    try {
      await this.loading.show();
      let result: Organization;
      if (!this.organization.organizationId) result = await this._organizations.insert(this.organization);
      else result = await this._organizations.update(this.organization);
      this.organization.load(result);
      this.message.success('COMMON.OPERATION_COMPLETED');
      this.close();
    } catch (err) {
      this.message.error('COMMON.OPERATION_FAILED');
    } finally {
      this.loading.hide();
    }
  }
  close(): void {
    this.organization = this.entityBeforeChange
    this.modalCtrl.dismiss();
  }

  async askAndDelete(): Promise<void> {
    const doDelete = async (): Promise<void> => {
      try {
        await this.loading.show();
        await this._organizations.delete(this.organization);
        this.message.success('COMMON.OPERATION_COMPLETED');
        this.close();
        this.app.goToInTabs(['organizations'])
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
