import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SessionsManagementPage } from './sessionsManagement.page';

const routes: Routes = [{ path: '', component: SessionsManagementPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SessionsManagementRoutingModule {}
