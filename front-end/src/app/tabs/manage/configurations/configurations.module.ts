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
import { DateTimeRangeWithTimezoneComponent } from '@app/common/datetimeRangeWithTimezone';
import { AddMealTypeComponent } from './meals/addMealType.component';

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
    DateTimeRangeWithTimezoneComponent
  ],
  declarations: [RegistrationsConfigurationsPage, MealsConfigurationsPage, AddMealTypeComponent]
})
export class ConfigurationsModule {}
