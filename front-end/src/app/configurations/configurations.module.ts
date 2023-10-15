import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { IDEACustomFieldsModule, IDEATranslationsModule } from '@idea-ionic/common';

import { ConfigurationsRoutingModule } from './configurations.routing.module';
import { ConfigurationsPage } from './configurations.page';
import { EmailsConfigurationsPage } from './emails/emailsConfig.page';
import { RegistrationsConfigurationsPage } from './registrations/registrationsConfig.page';
import { EmailTemplateModule } from './emails/emailTemplate/emailTemplate.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IDEATranslationsModule,
    IDEACustomFieldsModule,
    ConfigurationsRoutingModule,
    EmailTemplateModule
  ],
  declarations: [ConfigurationsPage, EmailsConfigurationsPage, RegistrationsConfigurationsPage]
})
export class ConfigurationsModule {}
