import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { IDEADateTimeModule, IDEATranslationsModule, IDEAUserAvatarModule } from '@idea-ionic/common';

import { UserRoutingModule } from './user-routing.module';
import { UserPage } from './user.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IDEATranslationsModule,
    IDEAUserAvatarModule,
    IDEADateTimeModule,
    UserRoutingModule
  ],
  declarations: [UserPage]
})
export class UserModule {}
