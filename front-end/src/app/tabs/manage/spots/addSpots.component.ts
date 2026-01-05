import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IDEALoadingService, IDEAMessageService, IDEATranslatePipe } from '@idea-ionic/common';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonList,
  IonSelectOption,
  IonSelect,
  IonTitle,
  IonToolbar,
  ModalController
} from '@ionic/angular/standalone';

import { AppService } from '@app/app.service';
import { SpotsService } from './spots.service';

import { EventSpot } from '@models/eventSpot.model';

@Component({
  selector: 'app-event-spots',
  imports: [
    // Angular
    CommonModule,
    FormsModule,
    // IDEA
    IDEATranslatePipe,
    // Ionic
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonList,
    IonSelect,
    IonSelectOption,
    IonTitle,
    IonToolbar
  ],
  templateUrl: 'addSpots.component.html',
  styleUrls: ['addSpots.component.scss']
})
export class AddSpotsComponent implements OnInit {
  errors = new Set<string>();

  numOfSpots = 1;
  spot = new EventSpot();

  private modalCtrl = inject(ModalController);
  private loading = inject(IDEALoadingService);
  private message = inject(IDEAMessageService);
  private _spots = inject(SpotsService);
  public app = inject(AppService);
  ngOnInit(): void {
    this.spot.type = this.app.configurations.spotTypes[0];
  }

  async save(): Promise<void> {
    this.errors = new Set(this.spot.validate());
    if (this.numOfSpots < 1) this.errors.add('numOfSpots');
    if (this.errors.size) return this.message.error('COMMON.FORM_HAS_ERROR_TO_CHECK');

    try {
      await this.loading.show();
      const newSpots = await this._spots.add(this.spot, this.numOfSpots);
      this.message.success('COMMON.OPERATION_COMPLETED');
      this.modalCtrl.dismiss(newSpots);
    } catch (error) {
      this.message.error('COMMON.OPERATION_FAILED');
    } finally {
      this.loading.hide();
    }
  }
  hasFieldAnError(field: string): boolean {
    return this.errors.has(field);
  }

  close(): void {
    this.modalCtrl.dismiss();
  }
}
