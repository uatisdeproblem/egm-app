import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output } from '@angular/core';
import { IDEATranslationsModule } from '@idea-ionic/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';

@Component({
  standalone: true,
  selector: 'app-barcode-scanner',
  imports: [CommonModule, IonicModule, IDEATranslationsModule],
  template: `
    @if (!autoStart) {
    <div class="barcodeScanner">
      <ion-button [color]="color" [fill]="fill" (click)="openScanner()">
        <ion-icon icon="scan-outline" slot="start" />
        {{ buttonLabel }}
      </ion-button>
    </div>
    }

    @if (isScanning) {
    <ion-card color="white" class="scannerCard">
      <ion-card-header>
        <ion-card-title>{{ buttonLabel }}</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <div [id]="scannerElementId" class="scannerHost"></div>
        <div class="actions">
          <ion-button fill="clear" color="medium" (click)="closeScanner()">
            {{ 'COMMON.CLOSE' | translate }}
          </ion-button>
        </div>
      </ion-card-content>
    </ion-card>
    }
  `,
  styles: [
    `
      div.barcodeScanner {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      ion-card.scannerCard {
        width: min(420px, calc(100vw - 32px));
        margin: 8px 0 0;
      }

      div.scannerHost {
        width: 100%;
        max-width: 360px;
        margin: 0 auto;
      }

      :host ::ng-deep div.scannerHost video {
        width: 100% !important;
        border-radius: 14px;
        background: #000;
      }

      :host ::ng-deep div.scannerHost section {
        border: 0 !important;
        padding: 0 !important;
      }

      :host ::ng-deep div.scannerHost section > div {
        box-shadow: none !important;
      }

      :host ::ng-deep div.scannerHost button,
      :host ::ng-deep div.scannerHost select {
        min-height: 36px;
        border-radius: 10px;
      }

      div.actions {
        display: flex;
        justify-content: flex-end;
        margin-top: 8px;
      }
    `
  ]
})
export class BarcodeScannerComponent implements OnInit, AfterViewChecked, OnDestroy {
  @Input() buttonLabel = 'Scan barcode';
  @Input() color = 'ESNgreen';
  @Input() fill: 'clear' | 'default' | 'outline' | 'solid' = 'solid';
  @Input() autoStart = false;

  @Output() scan = new EventEmitter<string>();

  readonly scannerElementId = `barcode-scanner-${Math.random().toString(36).slice(2)}`;

  isScanning = false;
  private pendingStart = false;
  private startInProgress = false;
  private scanner?: Html5QrcodeScanner;
  private lastDetectedCode = '';
  private lastDetectedCount = 0;

  constructor(
    private modalCtrl: ModalController,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    if (this.autoStart) this.openScanner();
  }

  ngAfterViewChecked(): void {
    if (this.pendingStart && !this.startInProgress) this.startScanner();
  }

  ngOnDestroy(): void {
    this.closeScanner();
  }

  openScanner(): void {
    this.isScanning = true;
    this.pendingStart = true;
  }

  closeScanner(): void {
    this.scanner?.clear().catch(error => console.warn('BARCODE SCANNER CLEAR ERROR:', error));
    this.scanner = undefined;
    this.isScanning = false;
    this.pendingStart = false;
    this.startInProgress = false;
    this.lastDetectedCode = '';
    this.lastDetectedCount = 0;
  }

  private startScanner(): void {
    if (this.startInProgress || this.scanner) return;

    this.startInProgress = true;
    this.scanner = new Html5QrcodeScanner(
      this.scannerElementId,
      {
        fps: 30,
        qrbox: { width: 300, height: 80 },
        rememberLastUsedCamera: true,
        supportedScanTypes: [0],
        formatsToSupport: [Html5QrcodeSupportedFormats.CODE_128]
      },
      false
    );

    this.scanner.render(
      decodedText => this.ngZone.run(() => this.onScanSuccess(decodedText)),
      () => undefined
    );

    this.pendingStart = false;
    this.startInProgress = false;
  }

  private onScanSuccess(value: string): void {
    const code = this.normalizeCode(value);
    if (!code) return;

    if (code === this.lastDetectedCode) this.lastDetectedCount += 1;
    else {
      this.lastDetectedCode = code;
      this.lastDetectedCount = 1;
    }

    if (this.lastDetectedCount < 2) return;
    this.emitScan(code);
  }

  private normalizeCode(value: string): string {
    return (value ?? '')
      .replace(/^\]C1/, '')
      .replace(/\u001d/g, '')
      .replace(/[^\x20-\x7E]/g, '')
      .trim();
  }

  private emitScan(value: string): void {
    if (!value) return;

    this.closeScanner();
    this.scan.emit(value);
    this.modalCtrl.dismiss({ cardCode: value });
  }
}
