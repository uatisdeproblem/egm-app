import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { IDEACustomFieldsModule, IDEATranslationsModule, IDEAUserAvatarModule } from '@idea-ionic/common';

import { RegistrationRoutingModule } from './registration-routing.module';
import { RegistrationsPage } from './registrations.page';
import { RegistrationPage } from './registration.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NgxDatatableModule,
    IDEATranslationsModule,
    IDEAUserAvatarModule,
    IDEACustomFieldsModule,
    RegistrationRoutingModule
  ],
  declarations: [RegistrationsPage, RegistrationPage]
})
export class RegistrationModule {}
