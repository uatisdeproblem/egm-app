import { Routes } from '@angular/router';

import { ManagePage } from './manage.page';

export const routes: Routes = [
  { path: '', component: ManagePage },
  {
    path: 'configurations',
    loadChildren: (): Promise<any> => import('./configurations/configurations.routes').then(m => m.routes)
  },
  {
    path: 'users',
    loadChildren: (): Promise<any> => import('./users/users.routes').then(m => m.routes)
  },
  {
    path: 'spots',
    loadChildren: (): Promise<any> => import('./spots/spots.routes').then(m => m.routes)
  },
  {
    path: 'meals',
    loadChildren: (): Promise<any> => import('./meals/mealsInfo.routes').then(m => m.routes)
  },
  {
    path: 'check-in',
    loadChildren: (): Promise<any> => import('./checkIn/checkIn.module').then(m => m.CheckInModule)
  },
  {
    path: 'registrations',
    loadChildren: (): Promise<any> => import('./registration/registration.routes').then(m => m.routes)
  },
  {
    path: 'import',
    loadChildren: (): Promise<any> => import('./import/import.routes').then(m => m.routes)
  },
  {
    path: 'sessions',
    loadChildren: (): Promise<any> =>
      import('./sessions/sessionsManagement.routes').then(m => m.routes)
  }
];
