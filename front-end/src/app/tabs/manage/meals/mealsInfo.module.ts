import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { IDEATranslationsModule } from '@idea-ionic/common';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { MealsInfoRoutingModule } from './mealsInfo-routing.module';
import { MealsInfoPage } from './mealsInfo.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, NgxDatatableModule, IDEATranslationsModule, MealsInfoRoutingModule],
  declarations: [MealsInfoPage]
})
export class MealsInfoModule {}
