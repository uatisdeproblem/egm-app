import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MealsPage } from './meals.page';
import { VerifyMealPage } from './verify-ticket/verify.meals.page';

const routes: Routes = [
  { path: '', component: MealsPage },
  { path: ':userId/verify-ticket/:mealTicketId', component: VerifyMealPage },
  { path: 'manage', component: MealsPage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MealsRoutingModule {}
