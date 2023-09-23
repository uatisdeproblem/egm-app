import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ManagePage } from './manage.page';

const routes: Routes = [{ path: '', component: ManagePage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageRoutingModule {}
