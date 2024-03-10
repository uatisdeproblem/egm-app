import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { IDEATranslationsModule } from '@idea-ionic/common';

import { SpeakersRoutingModule } from './speakers-routing.module';
import { SpeakerPage } from './speaker.page';
import { SpeakersPage } from './speakers.page';
import { SpeakerCardStandaloneComponent } from './speakerCard.component';
import { SessionCardStandaloneComponent } from '../sessions/sessionCard.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IDEATranslationsModule,
    SpeakersRoutingModule,
    SpeakerCardStandaloneComponent,
    SessionCardStandaloneComponent
  ],
  declarations: [SpeakersPage, SpeakerPage]
})
export class SpeakersModule {}
