import { Routes } from '@angular/router';

import { SpeakersPage } from './speakers.page';
import { SpeakerPage } from './speaker.page';

export const routes: Routes = [
  { path: '', component: SpeakersPage },
  { path: ':speakerId', component: SpeakerPage }
];
