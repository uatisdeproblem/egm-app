import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ContestsPage } from './contests.page';
import { ContestPage } from './contest.page';

const routes: Routes = [
  { path: '', component: ContestsPage },
  { path: ':contestId', component: ContestPage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContestsRoutingModule {}
