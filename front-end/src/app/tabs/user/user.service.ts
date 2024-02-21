import { Injectable } from '@angular/core';

import { SignedURL } from 'idea-toolbox';
import { IDEAApiService } from '@idea-ionic/common';

import { User } from '@models/user.model';
import { Configurations } from '@models/configurations.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private api: IDEAApiService) {}

  /**
   * Get the current user and app configuration.
   */
  async getCurrentUserAndConfiguration(): Promise<{ user: User; configurations: Configurations }> {
    const res = await this.api.getResource(['users', 'me']);
    return { user: new User(res), configurations: new Configurations(res.configurations) };
  }

  /**
   * Updates a user's data.
   */
  async update(updatedData: User): Promise<User> {
    return new User(await this.api.putResource(['users', updatedData.userId], { body: updatedData }));
  }

  /**
   * Upload a new avatar and returns the internal URI to it.
   */
  async uploadAvatarAndGetURI(file: File): Promise<string> {
    const body = { action: 'GET_AVATAR_UPLOAD_URL' };
    const { url, id } = await this.api.patchResource(['users', 'me'], { body });
    await fetch(url, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
    return id;
  }

  /**
   * Delete an account and all of its data.
   */
  async delete(): Promise<void> {
    await this.api.deleteResource(['users', 'me']);
  }

  /**
   * Register the user to the event.
   */
  async registerToEvent(registrationForm: any, isDraft: boolean): Promise<User> {
    const body = { action: 'REGISTER_TO_EVENT', registrationForm, isDraft };
    return new User(await this.api.patchResource(['users', 'me'], { body }));
  }

  /**
   * Get the user's invoice.
   */
  async getInvoice(): Promise<SignedURL> {
    const action = 'GET_INVOICE';
    return await this.api.patchResource(['users', 'me'], { body: { action } });
  }

  /**
   * Upload the proof of payment for the user's spot.
   */
  async uploadProofOfPayment(file: File): Promise<User> {
    const body: any = { action: 'PUT_PROOF_OF_PAYMENT_START' };
    const { url, id } = await this.api.patchResource(['users', 'me'], { body });
    await fetch(url, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
    body.action = 'PUT_PROOF_OF_PAYMENT_END';
    body.fileURI = id;
    return new User(await this.api.patchResource(['users', 'me'], { body }));
  }
  /**
   * Get the URL to the proof of payment of the user.
   */
  async getProofOfPaymentURL(): Promise<string> {
    const body = { action: 'GET_PROOF_OF_PAYMENT' };
    const { url } = await this.api.patchResource(['users', 'me'], { body });
    return url;
  }

  /**
   * Favorite a session.
   */
  async addFavoriteSession(sessionId: string): Promise<void> {
    const body = { action: 'ADD_FAVORITE_SESSION', sessionId };
    await this.api.patchResource(['users'], { body });
  }
  /**
   * Remove a session from the favorites.
   */
  async removeFavoriteSession(sessionId: string): Promise<void> {
    const body = { action: 'REMOVE_FAVORITE_SESSION', sessionId };
    await this.api.patchResource(['users'], { body });
  }
  /**
   * Get the user's favorited sessions (IDs).
   */
  async getFavoriteSessions(): Promise<string[]> {
    const body = { action: 'GET_FAVORITE_SESSIONS' };
    return await this.api.patchResource(['users'], { body });
  }
}
