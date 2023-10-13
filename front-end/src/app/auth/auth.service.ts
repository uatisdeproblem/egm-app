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
   * Get the current user.
   */
  async getCurrentUser(): Promise<User> {
    return new User(await this.api.getResource(['users', 'me']));
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

  // -----

  /**
   * Updates a profile.
   * ! Only for externals currently
   */
  async updateProfile(profile: User): Promise<void> {
    await this.api.putResource(['externals', profile.userId], { body: profile });
  }

  /**
   * Deletes a profile.
   */
  async deleteProfile(profile: User): Promise<void> {
    await this.api.deleteResource(['users', profile.userId]);
  }

  /**
   * Sets the image URI for the avatar.
   */
  async setImageURI(profile: User, file: File): Promise<string> {
    const { url, id } = await this.api.patchResource(['users'], {
      body: { action: 'GET_IMAGE_UPLOAD_URL' }
    });

    await fetch(url, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });

    return id;
  }
}
