import { Injectable } from '@angular/core';
import { IDEAApiService } from '@idea-ionic/common';
import { User } from '@models/user.model';

@Injectable({ providedIn: 'root' })
export class UsersService {
  constructor(private api: IDEAApiService) {}

  /**
   * Get the currentl user.
   */
  async getCurrentUser(): Promise<User> {
    return new User(await this.api.getResource(['users', 'me']));
  }

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
