import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { IDEATranslationsModule } from '@idea-ionic/common';

import { SessionsPage } from './sessions.page';
import { SessionPage } from './session.page';
import { SessionsRoutingModule } from './sessions-routing.module';
import { SessionDetailComponent } from './sessionDetail.component';
import { HTMLEditorComponent } from 'src/app/common/htmlEditor.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IDEATranslationsModule,
    SessionsRoutingModule,
    HTMLEditorComponent
  ],
  declarations: [SessionsPage, SessionPage, SessionDetailComponent]
})
export class SessionsModule {}
