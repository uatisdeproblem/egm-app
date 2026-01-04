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
        loadChildren: (): Promise<any> => import('./user/user.page').then(m => m.UserPage)
      },
      {
        path: 'manage',
        loadChildren: (): Promise<any> => import('./manage/manage.page').then(m => m.ManagePage),
        canActivate: [manageGuard]
      },
      {
        path: 'home',
        loadChildren: (): Promise<any> => import('./home/home.page').then(m => m.HomePage)
      },
      {
        path: 'menu',
        loadChildren: (): Promise<any> => import('./menu/menu.page').then(m => m.MenuPage),
        canActivate: [spotGuard]
      },
      {
        path: 'venues',
        loadChildren: (): Promise<any> => import('./venues/venues.routes').then(m => m.venuesRoutes),
        canActivate: [spotGuard]
      },
      {
        path: 'rooms',
        loadChildren: (): Promise<any> => import('./rooms/room.page').then(m => m.RoomPage),
        canActivate: [spotGuard]
      },
      {
        path: 'organizations',
        loadChildren: (): Promise<any> =>
          import('./organizations/organizations.page').then(m => m.OrganizationsPage),
        canActivate: [spotGuard]
      },
      {
        path: 'speakers',
        loadChildren: (): Promise<any> => import('./speakers/speakers.page').then(m => m.SpeakersPage),
        canActivate: [spotGuard]
      },
      {
        path: 'agenda',
        loadChildren: (): Promise<any> => import('./sessions/sessions.page').then(m => m.SessionsPage),
        canActivate: [spotGuard]
      },
      {
        path: 'contests',
        loadChildren: (): Promise<any> => import('./contests/contests.page').then(m => m.ContestsPage),
        canActivate: [spotGuard]
      },
      {
        path: 'meals',
        loadChildren: (): Promise<any> => import('./meals/meals.page').then(m => m.MealsPage),
        canActivate: [spotGuard]
      }
    ]
  }
];
