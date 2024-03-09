import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { IDEATranslationsModule } from '@idea-ionic/common';

import { MenuRoutingModule } from './menu.routing.module';
import { MenuPage } from './menu.page';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IDEATranslationsModule,
    MenuRoutingModule
  ],
  declarations: [MenuPage]
})
export class MenuModule {}
