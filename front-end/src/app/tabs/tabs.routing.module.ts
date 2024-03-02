import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TabsComponent } from './tabs.component';

const routes: Routes = [
  {
    path: '',
    component: TabsComponent,
    children: [
      { path: '', redirectTo: 'user', pathMatch: 'full' },
      {
        path: 'user',
        loadChildren: (): Promise<any> => import('./user/user.module').then(m => m.UserModule)
      },
      {
        path: 'manage',
        loadChildren: (): Promise<any> => import('./manage/manage.module').then(m => m.ManageModule)
      },
      {
        path: 'venues',
        loadChildren: (): Promise<any> => import('./venues/venues.module').then(m => m.VenuesModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)]
})
export class TabsComponentRoutingModule {}
