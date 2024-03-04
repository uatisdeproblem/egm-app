import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { IDEATranslationsModule } from '@idea-ionic/common';

import { RoomsRoutingModule } from './rooms-routing.module';
import { RoomPage } from './room.page';
import { RoomCardStandaloneComponent } from './roomCard.component';
import { SessionCardStandaloneComponent } from '../sessions/sessionCard.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IDEATranslationsModule,
    RoomsRoutingModule,
    RoomCardStandaloneComponent,
    SessionCardStandaloneComponent
  ],
  declarations: [RoomPage]
})
export class RoomsModule {}