import { Injectable } from '@angular/core';
import { IDEAApiService } from '@idea-ionic/common';

import { User, UserPermissions } from '@models/user.model';

@Injectable({ providedIn: 'root' })
export class UsersService {
  constructor(private api: IDEAApiService) {}

  /**
   * Get a user's data by its id.
   */
  async getById(userId: string): Promise<User> {
    return new User(await this.api.getResource(['users', userId]));
  }

  /**
   * Register the user to the event.
   */
  async registerToEvent(user: User, registrationForm: any, isDraft: boolean): Promise<User> {
    const body = { action: 'REGISTER_TO_EVENT', registrationForm, isDraft };
    return new User(await this.api.patchResource(['users', user.userId], { body }));
  }

  /**
   * Change the permissions of a user.
   */
  async changePermissions(user: User, permissions: UserPermissions): Promise<User> {
    const body = { action: 'CHANGE_PERMISSIONS', permissions };
    return new User(await this.api.patchResource(['users', user.userId], { body }));
  }

  /**
   * Get the URL to the proof of payment of the user.
   */
  async getProofOfPaymentURL(user: User): Promise<string> {
    const body = { action: 'GET_PROOF_OF_PAYMENT' };
    const { url } = await this.api.patchResource(['users', user.userId], { body });
    return url;
  }

  /**
   * Delete a user and its data.
   */
  async delete(user: User): Promise<void> {
    await this.api.deleteResource(['users', user.userId]);
  }

  /**
   * Get the list of the app's users.
   */
  async getList(): Promise<User[]> {
    const users: User[] = await this.api.getResource('users');
    return users.map(u => new User(u));
  }

  async getUsersConfirmed(): Promise<User[]> {
    const users: User[] = await this.api.getResource('users');
    return users.filter(user => user.spot?.paymentConfirmedAt).map(u => new User(u));
  }
}
