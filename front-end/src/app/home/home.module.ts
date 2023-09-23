import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { IDEATranslationsModule, IDEAUserAvatarModule } from '@idea-ionic/common';

import { HomePage } from './home.page';
import { HomeRoutingModule } from './home-routing.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, IDEATranslationsModule, HomeRoutingModule],
  declarations: [HomePage]
})
export class HomeModule {}
