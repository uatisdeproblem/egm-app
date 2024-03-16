import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { IDEATranslationsModule } from '@idea-ionic/common';

import { SessionsPage } from './sessions.page';
import { SessionsRoutingModule } from './sessions-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IDEATranslationsModule,
    SessionsRoutingModule
  ],
  declarations: [SessionsPage]
})
export class SessionsModule {}
