import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { IDEATranslationsModule } from '@idea-ionic/common';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { SpotsRoutingModule } from './spots-routing.module';
import { SpotsPage } from './spots.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, NgxDatatableModule, IDEATranslationsModule, SpotsRoutingModule],
  declarations: [SpotsPage]
})
export class SpotsModule {}
