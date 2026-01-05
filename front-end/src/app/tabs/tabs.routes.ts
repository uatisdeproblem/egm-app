import { Routes } from '@angular/router';

import { manageGuard } from '../manage.guard';
import { spotGuard } from '../spot.guard';

import { TabsComponent } from './tabs.component';

export const tabsRoutes: Routes = [
  {
    path: '',
    component: TabsComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'user',
        outlet: 'user',
        loadChildren: (): Promise<any> => import('./user/user.routes').then(m => m.routes)
      },
      {
        path: 'manage',
        outlet: 'manage',
        loadChildren: (): Promise<any> => import('./manage/manage.routes').then(m => m.routes),
        canActivate: [manageGuard]
      },
      {
        path: 'home',
        outlet: 'home',
        loadChildren: (): Promise<any> => import('./home/home.routes').then(m => m.routes)
      },
      {
        path: 'menu',
        outlet: 'menu',
        loadChildren: (): Promise<any> => import('./menu/menu.routes').then(m => m.routes),
        canActivate: [spotGuard]
      },
      {
        path: 'venues',
        outlet: 'venues',
        loadChildren: (): Promise<any> => import('./venues/venues.routes').then(m => m.routes),
        canActivate: [spotGuard]
      },
      {
        path: 'rooms',
        outlet: 'rooms',
        loadChildren: (): Promise<any> => import('./rooms/rooms.routes').then(m => m.routes),
        canActivate: [spotGuard]
      },
      {
        path: 'organizations',
        outlet: 'organizations',
        loadChildren: (): Promise<any> =>
          import('./organizations/organizations.routes').then(m => m.routes),
        canActivate: [spotGuard]
      },
      {
        path: 'speakers',
        outlet: 'speakers',
        loadChildren: (): Promise<any> => import('./speakers/speakers.routes').then(m => m.routes),
        canActivate: [spotGuard]
      },
      {
        path: 'agenda',
        outlet: 'agenda',
        loadChildren: (): Promise<any> => import('./sessions/sessions.routes').then(m => m.routes),
        canActivate: [spotGuard]
      },
      {
        path: 'contests',
        outlet: 'contests',
        loadChildren: (): Promise<any> => import('./contests/contests.routes').then(m => m.routes),
        canActivate: [spotGuard]
      },
      {
        path: 'meals',
        outlet: 'meals',
        loadChildren: (): Promise<any> => import('./meals/meals.routes').then(m => m.routes),
        canActivate: [spotGuard]
      }
    ]
  }
];
