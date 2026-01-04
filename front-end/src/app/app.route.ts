import { Routes } from '@angular/router';

import { initGuard } from './init.guard';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 't', pathMatch: 'full' },
  { path: 'documents',
    loadChildren: (): Promise<any> => import('./privacy/privacy.module').then(m => m.PrivacyModule),
    canActivate: [initGuard]
  },
  {
    path: 'app-status',
    loadChildren: (): Promise<any> => import('@idea-ionic/common').then(m => m.ideaAppStatusRoutes), // TODO update check
    canActivate: [initGuard]
  },
  {
    path: 'auth',
    loadChildren: (): Promise<any> => import('./auth/auth.page').then(m => m.AuthPage),
    canActivate: [initGuard]
  },
  {
    path: 't',
    loadChildren: (): Promise<any> => import('./tabs/tabs.routes').then(m => m.tabsRoutes),
    canActivate: [initGuard, authGuard]
  }
];
