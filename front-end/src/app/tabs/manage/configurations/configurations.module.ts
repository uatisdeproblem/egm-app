import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { IDEACustomFieldsModule, IDEAListModule, IDEATranslationsModule } from '@idea-ionic/common';

import { ConfigurationsRoutingModule } from './configurations-routing.module';

import { RegistrationsConfigurationsPage } from './registrations/registrationsConfig.page';
import { EmailTemplateModule } from './emailTemplate/emailTemplate.module';
import { DocumentTemplateModule } from './documentTemplate/documentTemplate.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IDEATranslationsModule,
    IDEACustomFieldsModule,
    IDEAListModule,
    ConfigurationsRoutingModule,
    EmailTemplateModule,
    DocumentTemplateModule
  ],
  declarations: [RegistrationsConfigurationsPage]
})
export class ConfigurationsModule {}
