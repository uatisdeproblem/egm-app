import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { IDEATranslationsModule } from '@idea-ionic/common';

import { TabsComponent } from './tabs.component';
import { TabsRoutingModule } from './tabs-routing.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, IDEATranslationsModule, TabsRoutingModule],
  declarations: [TabsComponent],
  exports: [TabsComponent]
})
export class TabsModule {}
