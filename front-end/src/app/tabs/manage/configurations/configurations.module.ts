import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { IDEACustomFieldsModule, IDEAListModule, IDEATranslationsModule } from '@idea-ionic/common';

import { ConfigurationsRoutingModule } from './configurations-routing.module';

import { RegistrationsConfigurationsPage } from './registrations/registrationsConfig.page';
import { EmailTemplateModule } from './emailTemplate/emailTemplate.module';
import { MealsConfigurationsPage } from './meals/mealsConfig.page';
import { DateRangeWithTimezoneStandaloneComponent } from '@app/common/dateRangeWithTimezone';
import { DateTimeRangeWithTimezone } from '@app/common/datetimeRangeWithTimezone';

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
    DateRangeWithTimezoneStandaloneComponent,
    DateTimeRangeWithTimezone
  ],
  declarations: [RegistrationsConfigurationsPage, MealsConfigurationsPage]
})
export class ConfigurationsModule {}
