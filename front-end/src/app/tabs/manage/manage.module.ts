import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { IDEATranslationsModule } from '@idea-ionic/common';

import { ManageRoutingModule } from './manage.routing.module';
import { ManagePage } from './manage.page';

import { ConfigurationsModule } from './configurations/configurations.module';
import { UsefulLinkStandaloneComponent } from 'src/app/common/usefulLinks/usefulLink.component';
import { ManageUsefulLinkStandaloneComponent } from 'src/app/common/usefulLinks/manageUsefulLink.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IDEATranslationsModule,
    ManageRoutingModule,
    ConfigurationsModule,
    UsefulLinkStandaloneComponent,
    ManageUsefulLinkStandaloneComponent
  ],
  declarations: [ManagePage]
})
export class ManageModule {}
