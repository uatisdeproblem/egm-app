import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { IDEATranslationsModule } from '@idea-ionic/common';

import { MealsRoutingModule } from './meals-routing.module';
import { MealsPage } from './meals.page';
import { MealCardStandaloneComponent } from './mealCard.component';
import { VerifyMealPage } from './verifyMeal/verifyMeal.page';
import { ZXingScannerModule } from '@zxing/ngx-scanner';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IDEATranslationsModule,
    MealsRoutingModule,
    MealCardStandaloneComponent,
    ZXingScannerModule
  ],
  declarations: [MealsPage]
})
export class MealsModule {}
