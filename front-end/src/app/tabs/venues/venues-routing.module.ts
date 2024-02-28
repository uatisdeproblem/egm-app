import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VenuesPage } from './venues.page';
import { VenuePage } from './venue.page';

const routes: Routes = [
  { path: '', component: VenuesPage },
  { path: ':venueId', component: VenuePage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VenuesRoutingModule {}
