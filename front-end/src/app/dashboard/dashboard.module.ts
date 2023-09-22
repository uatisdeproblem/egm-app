import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { IDEATranslationsModule, IDEAUserAvatarModule } from '@idea-ionic/common';

import { DashboardPage } from './dashboard.page';
import { DashboardRoutingModule } from './dashboard-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IDEATranslationsModule,
    IDEAUserAvatarModule,
    DashboardRoutingModule
  ],
  declarations: [DashboardPage]
})
export class DashboardModule {}
