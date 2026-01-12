import { Routes } from '@angular/router';

import { PrivacyPage } from './privacy-policy.page';
import { TermsPage } from './terms.page';

export const routes: Routes = [
  { path: 'privacy-policy', component: PrivacyPage },
  { path: 'terms', component: TermsPage }
];
