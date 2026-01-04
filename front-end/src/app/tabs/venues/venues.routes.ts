import { Routes } from '@angular/router';

import { VenuePage } from './venue.page';
import { VenuesPage } from './venues.page';

export const venuesRoutes: Routes = [
  { path: '', component: VenuesPage },
  { path: ':venueId', component: VenuePage }
];

export default venuesRoutes;