import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { IDEASelectModule, IDEATranslationsModule } from '@idea-ionic/common';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { SpotsRoutingModule } from './spots-routing.module';
import { SpotsPage } from './spots.page';

import { AddSpotsModule } from './addSpots.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NgxDatatableModule,
    IDEATranslationsModule,
    IDEASelectModule,
    SpotsRoutingModule,
    AddSpotsModule
  ],
  declarations: [SpotsPage]
})
export class SpotsModule {}
