import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonCheckbox,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonTitle,
  IonToolbar,
  ModalController
} from '@ionic/angular/standalone';
import { IDEATranslatePipe } from '@idea-ionic/common';

import { SessionType } from '@models/session.model';

@Component({
  selector: 'app-session-filters-modal',
  imports: [
    // Angular
    CommonModule,
    // IDEA
    IDEATranslatePipe,
    // Ionic
    IonButton,
    IonButtons,
    IonCheckbox,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonTitle,
    IonToolbar
  ],
  styles: [
    `
      .filterSectionTitle {
        padding-left: 8px;
      }
    `
  ],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar color="medium">
        <ion-buttons slot="start">
          <ion-button [title]="'COMMON.CLOSE' | translate" (click)="close()">
            <ion-icon slot="icon-only" icon="close-circle"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>{{ 'COMMON.FILTERS' | translate }}</ion-title>
        <ion-buttons slot="end">
          <ion-button [title]="'COMMON.DONE' | translate" (click)="apply()">
            <ion-icon slot="icon-only" icon="checkmark-circle"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list lines="full">
        <ion-list-header class="filterSectionTitle">
          <ion-label>
            <h3>{{ 'SESSIONS.TYPE' | translate }}</h3>
          </ion-label>
        </ion-list-header>
        <ion-item *ngFor="let type of availableTypes" button detail="false" (click)="toggleType(type, !isSelected(type))">
          <ion-checkbox
            slot="start"
            [checked]="isSelected(type)"
            (click)="$event.stopPropagation()"
            (ionChange)="toggleType(type, $event.detail.checked)"
          ></ion-checkbox>
          <ion-label>{{ 'SESSIONS.TYPES.' + type | translate }}</ion-label>
        </ion-item>
        <ion-item lines="none">
          <ion-button fill="clear" color="medium" (click)="clear()">
            {{ 'COMMON.CLEAR' | translate }}
          </ion-button>
        </ion-item>
      </ion-list>
    </ion-content>
  `
})
export class SessionFiltersModalComponent implements OnInit {
  @Input() selectedTypes: SessionType[] = [];

  availableTypes = Object.values(SessionType);
  private selectedTypeSet = new Set<SessionType>();

  private modalCtrl = inject(ModalController);

  ngOnInit(): void {
    this.selectedTypeSet = new Set(this.selectedTypes || []);
  }

  isSelected(type: SessionType): boolean {
    return this.selectedTypeSet.has(type);
  }

  toggleType(type: SessionType, checked: boolean): void {
    if (checked) this.selectedTypeSet.add(type);
    else this.selectedTypeSet.delete(type);
  }

  clear(): void {
    this.selectedTypeSet.clear();
    this.modalCtrl.dismiss({ types: [] });
  }

  apply(): void {
    this.modalCtrl.dismiss({ types: Array.from(this.selectedTypeSet) });
  }

  close(): void {
    this.modalCtrl.dismiss();
  }
}
