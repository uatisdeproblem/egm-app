import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SpeakersPage } from './speakers.page';
import { SpeakerPage } from './speaker.page';

const routes: Routes = [
  { path: '', component: SpeakersPage },
  { path: ':speakerId', component: SpeakerPage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SpeakersRoutingModule {}
