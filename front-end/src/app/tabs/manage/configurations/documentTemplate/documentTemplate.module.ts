import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { IDEATranslationsModule } from '@idea-ionic/common';

import { DocumentTemplateComponent } from './documentTemplate.component';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, IDEATranslationsModule],
  declarations: [DocumentTemplateComponent],
  exports: [DocumentTemplateComponent]
})
export class DocumentTemplateModule {}
