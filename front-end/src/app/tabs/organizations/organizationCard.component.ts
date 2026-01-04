import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonImg,
  IonSkeletonText
} from '@ionic/angular/standalone';

import { HTMLEditorComponent } from 'src/app/common/htmlEditor.component';

import { AppService } from 'src/app/app.service';

import { Organization } from '@models/organization.model';

@Component({
  standalone: true,
  imports: [
    // Angular
    CommonModule,
    FormsModule,
    // App
    HTMLEditorComponent,
    // Ionic
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonImg,
    IonSkeletonText
  ],
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

  public readonly app = inject(AppService);
}
