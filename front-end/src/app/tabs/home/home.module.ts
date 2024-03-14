import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { IDEATranslationsModule } from '@idea-ionic/common';

import { UsefulLinkStandaloneComponent } from 'src/app/common/usefulLinks/usefulLink.component';

import { HomeRoutingModule } from './home.routing.module';
import { HomePage } from './home.page';
import { CommunicationComponent } from './communications/communication.component';
import { CommunicationDetailComponent } from './communications/communicationDetail.component';
import { ManageCommunicationComponent } from './communications/manageCommunication.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IDEATranslationsModule,
    HomeRoutingModule,
    UsefulLinkStandaloneComponent,
    CommunicationComponent,
    CommunicationDetailComponent,
    ManageCommunicationComponent
  ],
  declarations: [HomePage]
})
export class HomeModule {}
