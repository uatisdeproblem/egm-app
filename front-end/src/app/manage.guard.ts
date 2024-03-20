import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';

import { AppService } from './app.service';

export const manageGuard: CanActivateFn = async (): Promise<boolean> => {
  const _app = inject(AppService);
  return _app.userCanManageSomething() || _app.user.permissions.isCountryLeader
};
