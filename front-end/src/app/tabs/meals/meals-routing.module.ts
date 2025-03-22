import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MealsPage } from './meals.page';
import { VerifyMealPage } from './verifyMeal/verifyMeal.page';

const routes: Routes = [
  { path: '', component: MealsPage },
  { path: 'verify/:mealId/:userId', component: VerifyMealPage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MealsRoutingModule {}
