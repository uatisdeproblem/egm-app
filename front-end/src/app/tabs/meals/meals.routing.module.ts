import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MealsPage } from './meals.page';
import { VerifyMealPage } from './verify-ticket/verify.meals.page';
import { MealsListPage } from './manage/meals-list/meals.list.page';
import { ManageMealsPage } from './manage/manage.meals.page';

const routes: Routes = [
  { path: '', component: MealsPage },
  { path: ':userId/verify-ticket/:mealTicketId', component: VerifyMealPage },
  { path: 'manage', component: ManageMealsPage },
  { path: 'manage/:mealTicketId', component: MealsListPage}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MealsRoutingModule {}
