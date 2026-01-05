import { Routes } from '@angular/router';

import { RoomPage } from './room.page';

export const routes: Routes = [
  { path: ':roomId', component: RoomPage },
  { path: '', redirectTo: '/', pathMatch: 'full' }
];
