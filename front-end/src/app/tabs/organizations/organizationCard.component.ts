import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { IDEATranslationsModule } from '@idea-ionic/common';

import { HTMLEditorComponent } from 'src/app/common/htmlEditor.component';

import { AppService } from 'src/app/app.service';

import { Organization } from '@models/organization.model';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, IDEATranslationsModule, HTMLEditorComponent],
  selector: 'app-organization-card',
  template: `
    <ion-card *ngIf="organization" color="white">
      <ion-img [src]="app.getImageURLByURI(organization.imageURI)"></ion-img>
      <ion-card-header>
        <ion-card-title>{{ organization.name }}</ion-card-title>
        <ion-card-subtitle>
          <a *ngIf="organization.website" [href]="(organization.website.startsWith('http') ? '' : 'http://') + organization.website" target="_blank">{{ organization.website }}</a>
        </ion-card-subtitle>
        <ion-card-subtitle>
          <a [href]="'mailto:' + organization.contactEmail">{{ organization.contactEmail }}</a>
        </ion-card-subtitle>
      </ion-card-header>
      <ion-card-content>
      <app-html-editor [content]="organization.description" [editMode]="false"></app-html-editor>
      </ion-card-content>
    </ion-card>

    <ion-card *ngIf="!organization" color="white">
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
export class OrganizationCardStandaloneComponent {
  @Input() organization: Organization;
  @Input() preview: boolean;

  constructor(public app: AppService) {}
}
