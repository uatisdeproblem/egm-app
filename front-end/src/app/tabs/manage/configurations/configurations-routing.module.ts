import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RegistrationsConfigurationsPage } from './registrations/registrationsConfig.page';
import { MealsConfigurationsPage } from './meals/mealsConfig.page';

const routes: Routes = [
  { path: 'registrations', component: RegistrationsConfigurationsPage },
  { path: 'meals', component: MealsConfigurationsPage}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfigurationsRoutingModule {}
