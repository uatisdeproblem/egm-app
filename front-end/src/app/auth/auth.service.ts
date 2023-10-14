import { Injectable } from '@angular/core';
import { IDEAApiService, IDEAStorageService } from '@idea-ionic/common';

import { User } from '@models/user.model';

const AUTH_TOKEN_STORAGE_KEY = 'authToken';

import { environment as env } from '@env';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private storage: IDEAStorageService, private api: IDEAApiService) {}

  /**
   * Save the authentication token in the storage.
   */
  async saveAuthToken(token: string): Promise<void> {
    await this.storage.set(AUTH_TOKEN_STORAGE_KEY, token);
    this.api.authToken = token;
  }
  /**
   * Load the authentication token from the storage.
   */
  async loadAuthToken(): Promise<string> {
    const token = await this.storage.get(AUTH_TOKEN_STORAGE_KEY);
    this.api.authToken = token;
    return token;
  }

  /**
   * Get the URL to follow to start a new sign-in flow with ESN Accounts.
   */
  getURLToStartSignInWithESNAccounts(): string {
    const apiLoginURL = `https://${env.idea.api.url}/${env.idea.api.stage}/galaxy`;
    const localhost = location.hostname.startsWith('localhost') ? '?localhost=8100' : '';
    return `https://accounts.esn.org/cas/login?service=${apiLoginURL}${localhost}`;
  }

  /**
   * Sign into Cognito.
   */
  async cognitoSignIn(email: string, password: string): Promise<void> {
    const body = { action: 'SIGN_IN', email, password };
    const { token } = await this.api.postResource('cognito', { body });
    await this.saveAuthToken(token);
  }
  /**
   * Start the flow to sign-up with Cognito.
   */
  async cognitoSignUp(email: string, password: string, firstName: string, lastName: string): Promise<void> {
    const body = { action: 'SIGN_UP', email, password, firstName, lastName };
    const { token } = await this.api.postResource('cognito', { body });
    await this.saveAuthToken(token);
  }
  /**
   * Start the flow to reset the Cognito password.
   */
  async resetPassword(email: string): Promise<void> {
    const body = { action: 'RESET_PASSWORD', email };
    await this.api.postResource('cognito', { body });
  }
  /**
   * Complete the flow to reset the Cognito password.
   */
  async resetPasswordConfirm(email: string, password: string, confirmationCode: string): Promise<void> {
    const body = { action: 'RESET_PASSWORD_CONFIRM', email, password, confirmationCode };
    await this.api.postResource('cognito', { body });
  }

  /**
   * Sign-out the current user.
   */
  async logout(): Promise<void> {
    await this.storage.clear();
    window.location.assign('');
  }
}
