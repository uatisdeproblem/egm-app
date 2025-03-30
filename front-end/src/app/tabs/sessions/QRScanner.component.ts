import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IDEALoadingService, IDEAMessageService, IDEATranslationsService } from '@idea-ionic/common';
import { AppService } from 'src/app/app.service';

@Component({
  selector: 'app-qr-scanner-modal',
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

  constructor(private modalCtrl: ModalController, public t: IDEATranslationsService) {}

  async onScanSuccess(result: string): Promise<void> {
    this.modalCtrl.dismiss(result);
  }

  close(): void {
    this.modalCtrl.dismiss();
  }
}
