import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { NavController, Platform } from '@ionic/angular';
import { IDEAStorageService } from '@idea-ionic/common';

import { AppService } from '@app/app.service';
import { UsersService } from '@app/users/users.service';
import { AuthService } from '@app/auth/auth.service';

export const authGuard: CanActivateFn = async (): Promise<boolean> => {
  const platform = inject(Platform);
  const navCtrl = inject(NavController);
  const storage = inject(IDEAStorageService);
  const auth = inject(AuthService);
  const _users = inject(UsersService);
  const app = inject(AppService);

  if (app.authReady) return true;

  //
  // HELPERS
  //

  const doAuth = async (): Promise<void> => {
    const token = await auth.loadAuthToken();
    if (!token) throw new Error('Missing auth token');
    app.user = await _users.getCurrentUser();
  };

  const navigateAndResolve = (navigationPath?: string[]): boolean => {
    if (navigationPath) navCtrl.navigateRoot(navigationPath);
    app.authReady = true;
    return true;
  };

  //
  // MAIN
  //

  if (app.authReady) return true;

  await platform.ready();
  await storage.ready();

  try {
    await doAuth();
    platform.resume.subscribe((): Promise<void> => doAuth());

    if (window.location.pathname === '/') return navigateAndResolve([]);
    else return navigateAndResolve();
  } catch (err) {
    return navigateAndResolve(['auth']);
  }
};
