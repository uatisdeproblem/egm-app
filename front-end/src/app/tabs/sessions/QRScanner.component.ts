import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { IDEATranslatePipe, IDEATranslationsService } from '@idea-ionic/common';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
  ModalController
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-qr-scanner-modal',
  imports: [
    // Angular
    CommonModule,
    //External
    ZXingScannerModule,
    // IDEA
    IDEATranslatePipe,
    // Ionic
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonTitle,
    IonToolbar
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>{{ 'SESSIONS.SCAN_QR_CODE' | translate }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="close()">
            <ion-icon name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="ion-padding">
        <zxing-scanner [device]="currentDevice" (scanSuccess)="onScanSuccess($event)"> </zxing-scanner>
      </div>
    </ion-content>
  `
})
export class QrScannerModalComponent {
  // @todo future improvement: refactor this into a common component to read QR Codes.

  @Input() sessionId: string;

  currentDevice: MediaDeviceInfo = null;
  availableDevices: MediaDeviceInfo[];

  private modalCtrl = inject(ModalController);
  public t = inject(IDEATranslationsService);

  async onScanSuccess(result: string): Promise<void> {
    this.modalCtrl.dismiss(result);
  }

  close(): void {
    this.modalCtrl.dismiss();
  }
}
