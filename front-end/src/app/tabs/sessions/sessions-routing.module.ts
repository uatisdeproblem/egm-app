import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SessionsPage } from './sessions.page';
import { SessionPage } from './session.page';

const routes: Routes = [
  { path: '', component: SessionsPage },
  { path: ':sessionId', component: SessionPage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SessionsRoutingModule {}
