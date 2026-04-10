import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IDEATranslationsModule } from '@idea-ionic/common';
import { IonicModule } from '@ionic/angular';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { BarcodeScannerComponent } from '@app/common/barcode/barcodeScanner.component';

import { CheckInRoutingModule } from './checkIn-routing.module';
import { CheckInPage } from './checkIn.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NgxDatatableModule,
    IDEATranslationsModule,
    BarcodeScannerComponent,
    CheckInPage,
    CheckInRoutingModule
  ]
})
export class CheckInModule {}
