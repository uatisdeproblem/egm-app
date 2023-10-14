import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TabsComponent } from './tabs.component';

const routes: Routes = [
  {
    path: '',
    component: TabsComponent,
    children: [
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
      {
        path: 'profile',
        loadChildren: (): Promise<any> => import('../profile/profile.module').then(m => m.ProfileModule)
      },
      {
        path: 'configurations',
        loadChildren: (): Promise<any> =>
          import('../configurations/configurations.module').then(m => m.ConfigurationsModule)
      },
      {
        path: 'event-registrations',
        loadChildren: (): Promise<any> => import('../registrations/registration.module').then(m => m.RegistrationModule)
      },
      {
        path: 'users',
        loadChildren: (): Promise<any> => import('../users/users.module').then(m => m.UsersModule)
      },
      {
        path: 'spots',
        loadChildren: (): Promise<any> => import('../spots/spots.module').then(m => m.SpotsModule)
      },
      {
        path: 'emails',
        loadChildren: (): Promise<any> => import('../configurations/emails/emails.module').then(m => m.EmailsModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)]
})
export class TabsComponentRoutingModule {}
