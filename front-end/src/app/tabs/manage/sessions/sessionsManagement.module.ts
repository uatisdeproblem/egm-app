import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { IDEASelectModule, IDEATranslationsModule } from '@idea-ionic/common';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { SessionsManagementRoutingModule } from './sessionsManagement-routing.module';
import { SessionsManagementPage } from './sessionsManagement.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NgxDatatableModule,
    IDEATranslationsModule,
    IDEASelectModule,
    SessionsManagementRoutingModule
  ],
  declarations: [SessionsManagementPage]
})
export class SessionsManagementModule {}