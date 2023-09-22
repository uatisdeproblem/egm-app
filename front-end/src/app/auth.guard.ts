import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { NavController, Platform } from '@ionic/angular';
import { IDEAApiService, IDEAStorageService } from '@idea-ionic/common';
import { IDEAAuthService } from '@idea-ionic/auth';

import { AppService } from './app.service';
import { UserProfile } from '@models/userProfile.model';

export const authGuard: CanActivateFn = async (): Promise<boolean> => {
  const platform = inject(Platform);
  const navCtrl = inject(NavController);
  const storage = inject(IDEAStorageService);
  const api = inject(IDEAApiService);
  const auth = inject(IDEAAuthService);
  const app = inject(AppService);

  if (app.authReady) return true;

  //
  // HELPERS
  //

  const doAuth = async (): Promise<{ authToken: string; user: UserProfile }> => {
    const authRes = await auth.isAuthenticated(false, freshIdToken => (api.authToken = freshIdToken));

    api.authToken = authRes.idToken;

    const { userId } = authRes.userDetails;

    try {
      app.user = new UserProfile(await api.getResource(['external', userId]));
    } catch (err) {
      throw new Error('Profile not found');
    }

    return { authToken: api.authToken as string, user: app.user };
  };

  const loadUserAndToken = async (): Promise<void> => {
    const tokenExpiresAt = await storage.get('tokenExpiresAt');
    if (!tokenExpiresAt || tokenExpiresAt < Date.now()) throw new Error('The token expired');

    api.authToken = await storage.get('token');
    if (!api.authToken) throw new Error('Missing token');

    app.user = new UserProfile(await storage.get('user'));
    if (!app.user) throw new Error('Missing user');
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

  let hasESNToken = false;
  let hasCognitoToken = false;

  try {
    await doAuth();
    platform.resume.subscribe(() => doAuth());
    hasCognitoToken = true;
  } catch (err) {
    hasCognitoToken = false;
  }

  try {
    await loadUserAndToken();
    hasESNToken = true;
  } catch (err) {
    hasESNToken = false;
  }

  if (hasESNToken || hasCognitoToken) {
    return window.location.pathname === '/' ? navigateAndResolve([]) : navigateAndResolve();
  } else return navigateAndResolve(['auth']);
};
