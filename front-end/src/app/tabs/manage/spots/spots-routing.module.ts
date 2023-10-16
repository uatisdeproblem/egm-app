import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SpotsPage } from './spots.page';

const routes: Routes = [{ path: '', component: SpotsPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SpotsRoutingModule {}
