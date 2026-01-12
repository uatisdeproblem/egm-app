import { Routes } from '@angular/router';

import { SessionsPage } from './sessions.page';
import { SessionPage } from './session.page';
import { ConfirmSessionComponent } from './verifyQrCode.component';

export const routes: Routes = [
  { path: '', component: SessionsPage },
  { path: ':sessionId', component: SessionPage },
  { path: 'verify/:sessionId', component: ConfirmSessionComponent }
];
