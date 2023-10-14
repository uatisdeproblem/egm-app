import { Injectable } from '@angular/core';
import { IDEAApiService } from '@idea-ionic/common';

import { User } from '@models/user.model';
import { Configuration } from '@models/configuration.model';

@Injectable({ providedIn: 'root' })
export class UsersService {
  constructor(private api: IDEAApiService) {}

  /**
   * Get the current user and app configuration.
   */
  async getCurrentUserAndConfiguration(): Promise<{ user: User; configurations: Configuration }> {
    const res = await this.api.getResource(['users', 'me']);
    return { user: new User(res), configurations: new Configuration(res.configurations) };
  }

  /**
   * Get a user's data by its id.
   */
  async getById(userId: string): Promise<User> {
    return new User(await this.api.getResource(['users', userId]));
  }

  /**
   * Updates a user's data.
   */
  async update(user: User): Promise<User> {
    return new User(await this.api.putResource(['users', user.userId], { body: user }));
  }

  /**
   * Upload a new avatar and returns the internal URI to it.
   */
  async uploadAvatarAndGetURI(user: User, file: File): Promise<string> {
    const body = { action: 'GET_AVATAR_UPLOAD_URL' };
    const { url, id } = await this.api.patchResource(['users', user.userId], { body });
    await fetch(url, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
    return id;
  }

  /**
   * Delete an account and all of its data.
   */
  async delete(user: User): Promise<void> {
    await this.api.deleteResource(['users', user.userId]);
  }

  /**
   * Register the user to the event.
   */
  async registerToEvent(user: User, registrationForm: any, isDraft: boolean): Promise<User> {
    const body = { action: 'REGISTER_TO_EVENT', registrationForm, isDraft };
    return new User(await this.api.patchResource(['users', user.userId], { body }));
  }

  /**
   * Get the list of the app's users.
   */
  async getList(): Promise<User[]> {
    const users: User[] = await this.api.getResource('users');
    return users.map(u => new User(u));
  }
}
