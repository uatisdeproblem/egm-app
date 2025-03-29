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
          <ion-button (click)="dismissModal()">
            <ion-icon name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="ion-padding">
        <zxing-scanner
          [device]="currentDevice"
          (scanSuccess)="onScanSuccess($event)">
        </zxing-scanner>
      </div>
    </ion-content>
  `
})
export class QrScannerModalComponent {
  @Input() sessionId: string;

  currentDevice: MediaDeviceInfo = null;
  availableDevices: MediaDeviceInfo[];
  isScanning: boolean = false;

  constructor(
    private modalCtrl: ModalController,
    private _loading: IDEALoadingService,
    private _message: IDEAMessageService,
    private _app: AppService,
    public t: IDEATranslationsService
  ) {}

  async onScanSuccess(result: string): Promise<void> {
    if (this.isScanning) return;

    try {
      await this._loading.show();
      this.isScanning = true;

      this.modalCtrl.dismiss(result);

    } catch (error) {
      this._message.error('COMMON.OPERATION_FAILED');
    } finally {
      await this._app.sleepForNumSeconds(1);
      this.isScanning = false;
      this._loading.hide();
    }
  }

  dismissModal(): void {
    this.modalCtrl.dismiss();
  }
}