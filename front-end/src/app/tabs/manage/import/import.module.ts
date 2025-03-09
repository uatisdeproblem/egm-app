import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { IDEASelectModule, IDEATranslationsModule } from '@idea-ionic/common';

import { ImportRoutingModule } from './import-routing.module';

import { ImportPage } from './import.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, IDEATranslationsModule, IDEASelectModule, ImportRoutingModule],
  declarations: [ImportPage]
})
export class ImportModule {}
