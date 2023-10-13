import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthPage } from './auth.page';
import { AuthCognitoPage } from './cognito.page';

const routes: Routes = [
  { path: '', component: AuthPage },
  { path: 'cognito', component: AuthCognitoPage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule {}
