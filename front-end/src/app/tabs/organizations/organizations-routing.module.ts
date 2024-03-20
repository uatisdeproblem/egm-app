import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OrganizationsPage } from './organizations.page';
import { OrganizationPage } from './organization.page';

const routes: Routes = [
  { path: '', component: OrganizationsPage },
  { path: ':organizationId', component: OrganizationPage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrganizationsRoutingModule {}
