import { Routes } from '@angular/router';

import { UserPage } from './user.page';

const routes: Routes = [
  { path: '', component: UserPage },
  {
    path: 'registration',
    loadChildren: (): Promise<any> =>
      import('../manage/registration/registration.routes').then(m => m.routes),
  }
];
