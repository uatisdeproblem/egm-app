import { Routes } from '@angular/router';

import { MealsPage } from './meals.page';
import { VerifyMealPage } from './verifyMeal/verifyMeal.page';

export const routes: Routes = [
  { path: '', component: MealsPage },
  { path: 'verify/:mealId/:userId', component: VerifyMealPage }
];
