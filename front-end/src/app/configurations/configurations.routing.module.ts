import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConfigurationsPage } from './configurations.page';
import { RegistrationsConfigurationsPage } from './registrations/registrationsConfig.page';
import { EmailsConfigurationsPage } from './emails/emailsConfig.page';

const routes: Routes = [
  { path: '', component: ConfigurationsPage },
  { path: 'emails', component: EmailsConfigurationsPage },
  { path: 'registrations', component: RegistrationsConfigurationsPage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfigurationsRoutingModule {}
