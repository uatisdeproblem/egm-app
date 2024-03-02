import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { IDEATranslationsModule } from '@idea-ionic/common';

import { AppService } from 'src/app/app.service';

import { Venue } from '@models/venue.model';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, IDEATranslationsModule],
  selector: 'app-venue-card',
  template: `
    <ion-card *ngIf="venue" color="white">
      <ion-img [src]="app.getImageURLByURI(venue.imageURI)"></ion-img>
      <ion-card-header>
        <ion-card-title>{{ venue.name }}</ion-card-title>
        <ion-card-subtitle>{{ venue.address }}</ion-card-subtitle>
      </ion-card-header>
      <ion-card-content>
        <!-- @todo add map #61 -->
        <!-- <div *ngIf="venue.address" class="ion-text-right" style="margin-bottom: 30px;">
          <ion-button (click)="openMap(venue.latitude, venue.longitude)">
            Navigate to the venue
            <ion-icon slot="end" name="navigate"></ion-icon>
          </ion-button>
        </div> -->
        <div class="divDescription" *ngIf="venue.description">
          <ion-textarea readonly [rows]="4" [(ngModel)]="venue.description"></ion-textarea>
        </div>
      </ion-card-content>
    </ion-card>

    <ion-card *ngIf="!venue" color="white">
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
export class VenueCardStandaloneComponent {
  @Input() venue: Venue;

  constructor(public app: AppService) {}

  openMap(latitude: number, longitude: number): void {
    return; // @todo add map #61
    // openGeoLocationInMap(latitude, longitude);
  }
}
