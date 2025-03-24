import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { initGuard } from './init.guard';
import { authGuard } from './auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 't', pathMatch: 'full' },
  { path: 'documents',
    loadChildren: (): Promise<any> => import('./privacy/privacy.module').then(m => m.PrivacyModule),
    canActivate: [initGuard]
  },
  {
    path: 'app-status',
    loadChildren: (): Promise<any> => import('@idea-ionic/common').then(m => m.IDEAAppStatusModule),
    canActivate: [initGuard]
  },
  {
    path: 'auth',
    loadChildren: (): Promise<any> => import('./auth/auth.module').then(m => m.AuthModule),
    canActivate: [initGuard]
  },
  {
    path: 't',
    loadChildren: (): Promise<any> => import('./tabs/tabs.module').then(m => m.TabsModule),
    canActivate: [initGuard, authGuard]
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
      paramsInheritanceStrategy: 'always',
      bindToComponentInputs: true
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
