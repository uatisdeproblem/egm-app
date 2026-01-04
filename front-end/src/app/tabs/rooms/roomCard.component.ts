import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonIcon,
  IonImg,
  IonLabel,
  IonSkeletonText
} from '@ionic/angular/standalone';

import { HTMLEditorComponent } from 'src/app/common/htmlEditor.component';

import { AppService } from 'src/app/app.service';

import { Room } from '@models/room.model';

@Component({
  standalone: true,
  imports: [
    // Angular
    CommonModule,
    FormsModule,
    // App
    HTMLEditorComponent,
    // Ionic
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonIcon,
    IonImg,
    IonLabel,
    IonSkeletonText
  ],
  selector: 'app-room-card',
  template: `
    <ng-container *ngIf="room; else skeletonTemplate">
      <ion-card *ngIf="preview" [color]="preview ? 'white' : ''">
        <ion-card-header>
          <ion-card-title>{{ room.name }}</ion-card-title>
          <ion-card-subtitle>{{ room.internalLocation }}</ion-card-subtitle>
        </ion-card-header>
      </ion-card>

      <ion-card *ngIf="!preview" color="white">
        <ion-img [src]="app.getImageURLByURI(room.imageURI)"></ion-img>
        <ion-card-header>
          <ion-card-subtitle style="font-weight: 300;" class="ion-text-right">
            <ion-button fill="clear" (click)="app.goToInTabs(['venues', room.venue.venueId])">
              <ion-icon name="location-outline"></ion-icon>
              <ion-label>
                {{ room.venue.name }}
              </ion-label>
            </ion-button>
          </ion-card-subtitle>
          <ion-card-title>{{ room.name }}</ion-card-title>
          <ion-card-subtitle>{{ room.internalLocation }}</ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
        <app-html-editor [content]="room.description" [editMode]="false"></app-html-editor>
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
export class RoomCardStandaloneComponent {
  @Input() room: Room;
  @Input() preview: boolean;

  public readonly app = inject(AppService);
}
