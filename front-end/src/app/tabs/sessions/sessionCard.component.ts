import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { IDEATranslationsModule } from '@idea-ionic/common';

import { HTMLEditorComponent } from 'src/app/common/htmlEditor.component';

import { AppService } from 'src/app/app.service';

import { Session } from '@models/session.model';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, IDEATranslationsModule, HTMLEditorComponent],
  selector: 'app-session-card',
  template: `
    <ng-container *ngIf="session; else skeletonTemplate">
      <ion-card *ngIf="preview" [color]="preview ? 'white' : ''">
        <ion-card-header>
          <ion-card-title>{{ session.name }}</ion-card-title>
        </ion-card-header>
      </ion-card>

      <ion-card *ngIf="!preview" color="white">
        <ion-card-header>
          <ion-card-subtitle style="font-weight: 300;" class="ion-text-right">
            <ion-button fill="clear" (click)="app.goToInTabs(['sessions', session.sessionId])">
              <ion-icon name="location-outline"></ion-icon>
              <ion-label>
                {{ session.room.venue.name }}
              </ion-label>
            </ion-button>
          </ion-card-subtitle>
          <ion-card-title>{{ session.name }}</ion-card-title>
          <ion-card-subtitle>{{ session.description }}</ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
        <app-html-editor [content]="session.description" [editMode]="false"></app-html-editor>
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
export class SessionCardStandaloneComponent {
  @Input() session: Session;
  @Input() preview: boolean;

  constructor(public app: AppService) {}
}