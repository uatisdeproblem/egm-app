import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SessionsPage } from './sessions.page';
import { SessionPage } from './session.page';
import { ConfirmSessionComponent } from './verifyQrCode.component';

const routes: Routes = [
  { path: '', component: SessionsPage },
  { path: ':sessionId', component: SessionPage },
  { path: 'verify/:sessionId', component: ConfirmSessionComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SessionsRoutingModule {}
