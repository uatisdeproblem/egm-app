import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { IDEATranslationsModule } from '@idea-ionic/common';

import { PrivacyRoutingModule } from './privacy-routing.module';
import { PrivacyPage } from './privacy-policy.page';
import { TermsPage } from './terms.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, IDEATranslationsModule, PrivacyRoutingModule],
  declarations: [PrivacyPage, TermsPage]
})
export class PrivacyModule {}
