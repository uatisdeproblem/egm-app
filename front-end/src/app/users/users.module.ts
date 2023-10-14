import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { IDEATranslationsModule } from '@idea-ionic/common';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { UsersRoutingModule } from './users-routing.module';
import { UsersPage } from './users.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, NgxDatatableModule, IDEATranslationsModule, UsersRoutingModule],
  declarations: [UsersPage]
})
export class UsersModule {}
