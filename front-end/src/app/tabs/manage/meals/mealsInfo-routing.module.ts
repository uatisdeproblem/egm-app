import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MealsInfoPage } from './mealsInfo.page';

const routes: Routes = [{ path: '', component: MealsInfoPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MealsInfoRoutingModule {}
