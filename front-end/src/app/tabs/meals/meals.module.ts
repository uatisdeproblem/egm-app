import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { IDEATranslationsModule } from '@idea-ionic/common';
import { QRCodeModule } from 'angularx-qrcode';
import { MealsRoutingModule } from './meals.routing.module';
import { MealsPage } from './meals.page';
import { VerifyMealPage } from './verify-ticket/verify.meals.page';
import { MealsListPage } from './manage/meals-list/meals.list.page';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ManageMealsPage } from './manage/manage.meals.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IDEATranslationsModule,
    QRCodeModule,
    NgxDatatableModule,
    MealsRoutingModule,
  ],
  declarations: [MealsPage, VerifyMealPage, ManageMealsPage, MealsListPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MealsModule {}
