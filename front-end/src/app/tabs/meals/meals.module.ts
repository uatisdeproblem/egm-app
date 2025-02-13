import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { IDEATranslationsModule } from '@idea-ionic/common';
import { QRCodeModule } from 'angularx-qrcode';
import { MealsRoutingModule } from './meals.routing.module';
import { MealsPage } from './meals.page';
import { VerifyMealPage } from './verify-ticket/verify.meals.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IDEATranslationsModule,
    QRCodeModule,
    MealsRoutingModule,
  ],
  declarations: [MealsPage, VerifyMealPage]
})
export class MealsModule {}
