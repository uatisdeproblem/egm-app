import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { IDEACustomFieldsModule, IDEADateTimeComponent, IDEADateTimeModule, IDEATranslationsModule, IDEAUserAvatarModule } from '@idea-ionic/common';

import { RegistrationRoutingModule } from './registration-routing.module';
import { RegistrationPage } from './registration.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IDEATranslationsModule,
    IDEAUserAvatarModule,
    IDEACustomFieldsModule,
    IDEADateTimeModule,
    RegistrationRoutingModule
  ],
  declarations: [RegistrationPage]
})
export class RegistrationModule {}
