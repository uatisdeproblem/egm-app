import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { IDEATranslationsModule } from '@idea-ionic/common';
import { QRCodeModule } from 'angularx-qrcode';
import { MealsRoutingModule } from './meals.routing.module';
import { MealsPage } from './meals.page';
import { MealsManagePage } from './manage/meals.manage.page';
import { VerifyMealPage } from './verify-ticket/verify.meals.page';
import { DateRangeWithTimezoneStandaloneComponent } from '@app/common/dateRangeWithTimezone';
import { DateTimeRangeWithTimezone } from '@app/common/datetimeRangeWithTimezone';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IDEATranslationsModule,
    QRCodeModule,
    MealsRoutingModule,
    DateRangeWithTimezoneStandaloneComponent,
    DateTimeRangeWithTimezone
  ],
  declarations: [MealsPage, MealsManagePage, VerifyMealPage]
})
export class MealsModule {}
