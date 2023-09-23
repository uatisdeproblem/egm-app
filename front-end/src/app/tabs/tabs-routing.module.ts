import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsComponent } from './tabs.component';

const routes: Routes = [
  {
    path: '',
    component: TabsComponent,
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        loadChildren: (): Promise<any> => import('../home/home.module').then(m => m.HomeModule)
      },
      {
        path: 'profile',
        loadChildren: () => import('../users/profile/profile.module').then(m => m.ProfileModule)
      },
      {
        path: 'manage',
        loadChildren: () => import('../manage/manage.module').then(m => m.ManageModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsRoutingModule {}
