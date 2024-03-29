import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';

import { AppService } from './app.service';

export const spotGuard: CanActivateFn = async (): Promise<boolean> => {
  const _app = inject(AppService);
  if (_app.userCanManageSomething()) return true
  else return _app.user.spot?.paymentConfirmedAt ? true : false;
};
