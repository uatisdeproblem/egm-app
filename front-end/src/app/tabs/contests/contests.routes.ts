import { Routes } from '@angular/router';

import { ContestsPage } from './contests.page';
import { ContestPage } from './contest.page';

export const routes: Routes = [
  { path: '', component: ContestsPage },
  { path: ':contestId', component: ContestPage }
];
