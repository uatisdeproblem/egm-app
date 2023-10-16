import { Injectable } from '@angular/core';
import { IDEAApiService } from '@idea-ionic/common';

import { User } from '@models/user.model';

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
   * Get the list of the app's users.
   */
  async getList(): Promise<User[]> {
    const users: User[] = await this.api.getResource('users');
    return users.map(u => new User(u));
  }
}
