import { Routes } from '@angular/router';

import { AuthPage } from './auth.page';
import { AuthCognitoPage } from './cognito.page';

export const routes: Routes = [
  { path: '', component: AuthPage },
  { path: 'cognito', component: AuthCognitoPage }
];
