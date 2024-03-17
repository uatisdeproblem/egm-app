import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { IDEATranslationsModule } from '@idea-ionic/common';

import { HTMLEditorComponent } from 'src/app/common/htmlEditor.component';

import { AppService } from 'src/app/app.service';

import { Speaker } from '@models/speaker.model';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, IDEATranslationsModule, HTMLEditorComponent],
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
            <ion-button
              fill="clear"
              color="dark"
              (click)="app.goToInTabs(['organizations', speaker.organization.organizationId])"
            >
              {{ speaker.organization.name }}
            </ion-button>
          </ion-card-subtitle>
          <ion-card-subtitle>
            <a [href]="'mailto:' + speaker.contactEmail">{{ speaker.contactEmail }}</a>
          </ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          <ion-list>
            <ion-item *ngIf="speaker.socialMedia.linkedIn">
              <ion-icon name="logo-linkedin" slot="start"/>
              <ion-input [(ngModel)]="speaker.socialMedia.linkedIn"></ion-input>
            </ion-item>
            <ion-item *ngIf="speaker.socialMedia.instagram">
              <ion-icon name="logo-instagram" slot="start"/>
              <ion-input [(ngModel)]="speaker.socialMedia.instagram"></ion-input>
            </ion-item>
            <ion-item *ngIf="speaker.socialMedia.twitter">
              <ion-icon name="logo-twitter" slot="start"/>
              <ion-input [(ngModel)]="speaker.socialMedia.twitter"></ion-input>
            </ion-item>
            <app-html-editor [content]="speaker.description" [editMode]="false"></app-html-editor>
          </ion-list>
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