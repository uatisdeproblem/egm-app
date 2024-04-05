import { NgModule } from '@angular/core';

import { ContestsRoutingModule } from './contests.routing.module';
import { ContestsPage } from './contests.page';
import { ContestPage } from './contest.page';

@NgModule({
  imports: [ContestsRoutingModule, ContestsPage, ContestPage]
})
export class ContestsModule {}
