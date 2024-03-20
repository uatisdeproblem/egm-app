import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { IDEATranslationsModule } from '@idea-ionic/common';

import { OrganizationsRoutingModule } from './organizations-routing.module';
import { OrganizationPage } from './organization.page';
import { OrganizationsPage } from './organizations.page';
import { OrganizationCardStandaloneComponent } from './organizationCard.component';
import { SpeakerCardStandaloneComponent } from '../speakers/speakerCard.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IDEATranslationsModule,
    OrganizationsRoutingModule,
    OrganizationCardStandaloneComponent,
    SpeakerCardStandaloneComponent
  ],
  declarations: [OrganizationsPage, OrganizationPage]
})
export class OrganizationsModule {}
