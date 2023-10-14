import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { IDEATranslationsModule } from '@idea-ionic/common';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { EmailsRoutingModule } from './emails-routing.module';
import { EmailsPage } from './emails.page';
import { EmailTemplateModule } from './emailTemplate/emailTemplate.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NgxDatatableModule,
    IDEATranslationsModule,
    EmailsRoutingModule,
    EmailTemplateModule
  ],
  declarations: [EmailsPage]
})
export class EmailsModule {}
