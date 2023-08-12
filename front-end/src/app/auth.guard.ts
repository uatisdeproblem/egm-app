import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Platform, NavController } from '@ionic/angular';
import { CognitoUser } from 'idea-toolbox';
import { IDEAApiService, IDEAStorageService } from '@idea-ionic/common';
import { IDEAAuthService } from '@idea-ionic/auth';

import { AppService } from './app.service';

import { User } from '@models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private platform: Platform,
    private navCtrl: NavController,
    private storage: IDEAStorageService,
    private auth: IDEAAuthService,
    private api: IDEAApiService,
    private app: AppService
  ) {}

  async canActivate(): Promise<boolean> {
    console.log('hello');
    if (this.app.authReady) return true;
    console.log('there');

    await this.platform.ready();
    await this.storage.ready();

    let hasESNToken = false;
    let hasCognitoToken = false;

    try {
      await this.doAuth();
      this.platform.resume.subscribe(() => this.doAuth());
      hasCognitoToken = true;
    } catch (err) {
      hasCognitoToken = false;
    }

    try {
      await this.loadUserAndToken();
      hasESNToken = true;
    } catch (err) {
      hasESNToken = false;
    }

    if (hasESNToken || hasCognitoToken) {
      return window.location.pathname === '/' ? this.navigateAndResolve([]) : this.navigateAndResolve();
    } else return this.navigateAndResolve(['auth']);
  }

  private async doAuth(): Promise<{ authToken: string; user: User }> {
    const authRes = await this.auth.isAuthenticated(false, freshIdToken => (this.api.authToken = freshIdToken));

    this.api.authToken = authRes.idToken;

    const { userId, name, email, picture } = authRes.userDetails;

    this.app.user = new User({
      userId,
      name,
      email,
      roles: [],
      sectionCode: 'EXT', // @todo check this
      section: 'external', // @todo check this
      country: 'external', // @todo check this
      avatarURL: picture,
      isExternal: true,
      isAdministrator: false // externals can't be admins
    });

    return { authToken: this.api.authToken, user: this.app.user };
  }
  private async loadUserAndToken(): Promise<void> {
    const tokenExpiresAt = await this.storage.get('tokenExpiresAt');
    if (!tokenExpiresAt || tokenExpiresAt < Date.now()) throw new Error('The token expired');

    this.api.authToken = await this.storage.get('token');
    if (!this.api.authToken) throw new Error('Missing token');

    this.app.user = new User(await this.storage.get('user'));
    if (!this.app.user) throw new Error('Missing user');
  }
  private navigateAndResolve(navigationPath?: string[]): boolean {
    if (navigationPath) this.navCtrl.navigateRoot(navigationPath);
    this.app.authReady = true;
    return true;
  }
}
