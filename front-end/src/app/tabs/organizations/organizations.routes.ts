import { Routes } from '@angular/router';

import { OrganizationsPage } from './organizations.page';
import { OrganizationPage } from './organization.page';

export const routes: Routes = [
  { path: '', component: OrganizationsPage },
  { path: ':organizationId', component: OrganizationPage }
];
