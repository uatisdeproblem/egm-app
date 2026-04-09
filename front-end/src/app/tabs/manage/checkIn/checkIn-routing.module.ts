import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CheckInPage } from './checkIn.page';

const routes: Routes = [{ path: '', component: CheckInPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CheckInRoutingModule {}
