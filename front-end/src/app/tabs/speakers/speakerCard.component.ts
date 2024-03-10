import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { IDEATranslationsModule } from '@idea-ionic/common';

import { AppService } from 'src/app/app.service';

import { Speaker } from '@models/speaker.model';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, IDEATranslationsModule],
  selector: 'app-speaker-card',
  template: `
    <ng-container *ngIf="speaker; else skeletonTemplate">
      <ion-card *ngIf="preview" [color]="preview ? 'white' : ''">
        <ion-card-header>
          <ion-card-title>{{ speaker.name }}</ion-card-title>
          <ion-card-subtitle>{{ speaker.organization.name }}</ion-card-subtitle>
        </ion-card-header>
      </ion-card>

      <ion-card *ngIf="!preview" color="white">
        <ion-card-header>
          <ion-card-subtitle class="ion-text-right">
            <ion-img [src]="app.getImageURLByURI(speaker.imageURI)"></ion-img>
          </ion-card-subtitle>
          <ion-card-title>{{ speaker.name }}</ion-card-title>
          <ion-card-subtitle>
            <ion-button fill="clear" color="dark" (click)="app.goToInTabs(['organizations', speaker.organization.organizationId])">
              {{ speaker.organization.name }}
            </ion-button>
          </ion-card-subtitle>
          <ion-card-subtitle>
            <a [href]="'mailto:' + speaker.contactEmail">{{ speaker.contactEmail }}</a>
          </ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          <div class="divDescription" *ngIf="speaker.description">
            <ion-textarea readonly [rows]="4" [(ngModel)]="speaker.description"></ion-textarea>
          </div>
        </ion-card-content>
      </ion-card>
    </ng-container>

    <ng-template #skeletonTemplate>
      <ion-card color="white">
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
    </ng-template>
  `
})
export class SpeakerCardStandaloneComponent {
  @Input() speaker: Speaker;
  @Input() preview: boolean;

  constructor(public app: AppService) {}
}