import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ManagePage } from './manage.page';

const routes: Routes = [
  { path: '', component: ManagePage },
  {
    path: 'configurations',
    loadChildren: (): Promise<any> => import('./configurations/configurations.module').then(m => m.ConfigurationsModule)
  },
  {
    path: 'users',
    loadChildren: (): Promise<any> => import('./users/users.module').then(m => m.UsersModule)
  },
  {
    path: 'spots',
    loadChildren: (): Promise<any> => import('./spots/spots.module').then(m => m.SpotsModule)
  },
  {
    path: 'registrations',
    loadChildren: (): Promise<any> => import('./registration/registration.module').then(m => m.RegistrationModule )
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageRoutingModule {}
