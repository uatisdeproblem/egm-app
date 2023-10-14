import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EmailsPage } from './emails.page';

const routes: Routes = [{ path: '', component: EmailsPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmailsRoutingModule {}
