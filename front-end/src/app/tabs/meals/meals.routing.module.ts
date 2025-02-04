import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MealsPage } from './meals.page';
import { MealsManagePage } from './manage/meals.manage.page';
import { VerifyMealPage } from './verify-ticket/verify.meals.page';

const routes: Routes = [
  { path: '', component: MealsPage },
  { path: 'verify-ticket/:userId', component: VerifyMealPage },
  { path: 'manage', component: MealsManagePage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MealsRoutingModule {}
