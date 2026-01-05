import { Routes } from '@angular/router';

import { VenuePage } from './venue.page';
import { VenuesPage } from './venues.page';

export const routes: Routes = [
  { path: '', component: VenuesPage },
  { path: ':venueId', component: VenuePage }
];
