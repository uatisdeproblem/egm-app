import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RegistrationsPage } from './registrations.page';
import { RegistrationPage } from './registration.page';

const routes: Routes = [
  { path: '', component: RegistrationsPage },
  { path: ':registrationId', component: RegistrationPage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RegistrationRoutingModule {}
