import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PrivacyPage } from './privacy-policy.page';
import { TermsPage } from './terms.page';

const routes: Routes = [
  { path: 'privacy-policy', component: PrivacyPage },
  { path: 'terms', component: TermsPage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class PrivacyRoutingModule {}
