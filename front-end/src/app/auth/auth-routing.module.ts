import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthPage } from './auth.page';

const routes: Routes = [
  { path: '', component: AuthPage },
  {
    path: 'external',
    loadChildren: (): Promise<any> => import('@idea-ionic/auth').then(m => m.IDEAAuthModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule {}
