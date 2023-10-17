import { Injectable } from '@angular/core';
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
}
