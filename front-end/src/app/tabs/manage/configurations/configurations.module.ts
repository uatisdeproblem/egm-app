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
import { DishListModalComponent } from './meals/dish/dishList.component';
import { AddDishModalComponent } from './meals/dish/addDish.component';
import { HTMLEditorComponent } from '@app/common/htmlEditor.component';

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
    DateTimeRangeWithTimezoneComponent,
    HTMLEditorComponent
  ],
  declarations: [RegistrationsConfigurationsPage, MealsConfigurationsPage,
                 AddMealTypeComponent, DishListModalComponent, AddDishModalComponent]
})
export class ConfigurationsModule {}
