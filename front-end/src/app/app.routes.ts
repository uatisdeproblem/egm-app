import { Routes } from '@angular/router';

import { initGuard } from './init.guard';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 't', pathMatch: 'full' },
  { path: 'documents',
    loadChildren: (): Promise<any> => import('./privacy/privacy.routes').then(m => m.routes),
    canActivate: [initGuard]
  },
  {
    path: 'app-status',
    loadChildren: (): Promise<any> => import('@idea-ionic/common').then(m => m.ideaAppStatusRoutes), // TODO update check
    canActivate: [initGuard]
  },
  {
    path: 'auth',
    loadChildren: (): Promise<any> => import('./auth/auth.routes').then(m => m.routes),
    canActivate: [initGuard]
  },
  {
    path: 't',
    loadChildren: (): Promise<any> => import('./tabs/tabs.routes').then(m => m.tabsRoutes),
    canActivate: [initGuard, authGuard]
  }
];
