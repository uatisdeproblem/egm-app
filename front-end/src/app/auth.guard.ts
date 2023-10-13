import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { NavController, Platform } from '@ionic/angular';
import { IDEAApiService, IDEAStorageService } from '@idea-ionic/common';

import { AppService } from './app.service';
import { UsersService } from './users/users.service';

export const authGuard: CanActivateFn = async (): Promise<boolean> => {
  const platform = inject(Platform);
  const navCtrl = inject(NavController);
  const storage = inject(IDEAStorageService);
  const api = inject(IDEAApiService);
  const _users = inject(UsersService);
  const app = inject(AppService);

  if (app.authReady) return true;

  //
  // HELPERS
  //

  const doAuth = async (): Promise<void> => {
    api.authToken = await storage.get('authToken');
    if (!api.authToken) throw new Error('Missing auth token');
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
