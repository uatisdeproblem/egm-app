import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConfigurationsPage } from './configurations.page';
import { RegistrationsConfigurationsPage } from './registrations/registrationsConfig.page';

const routes: Routes = [
  { path: '', component: ConfigurationsPage },
  { path: 'registrations', component: RegistrationsConfigurationsPage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfigurationsRoutingModule {}
